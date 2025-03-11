"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMelodiousContext } from "@/contexts/melodious";
import { useRouter } from "next/navigation";
import { post } from "@/lib/api";
import { useActiveAccount, useConnectModal } from "thirdweb/react";
import { useCallback, useEffect, useState } from "react";
import { client } from "@/lib/client";
import toast from "react-hot-toast";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters.",
  }),
  country: z.string({
    message: "You must select a country",
  }),
});

const RegisterListener = () => {
  const { createUser } = useMelodiousContext();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const activeAccount = useActiveAccount();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      displayName: "",
      country: "",
    },
  });

  const { connect, isConnecting } = useConnectModal();
  const handleConnect = useCallback(async () => {
    const wallet = await connect({ client: client }); // opens the connect modal
    console.log("connected to", wallet);
  }, [connect]);

  useEffect(() => {
    const walletAddress = activeAccount?.address;
    console.log("walletAddress", walletAddress);
    if (!walletAddress) {
      handleConnect();
    }
  }, [activeAccount, handleConnect]);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const walletAddress = activeAccount?.address;
    const chainId = "31337";
    console.log("walletAddress", walletAddress);

    createUser({
      name: values.name,
      displayName: values.displayName,
      username: values.username,
      userType: "LISTENER",
      country: values.country,
    })
      .then((data) => {
        // console.log("User created with transaction hash:", data);
        // router.push("/auth/login");
        localStorage.clear();
        setLoading(false);
        // window.location.href = "/auth/login";

        console.log("User created with transaction hash:");
        toast.success(
          `Transaction submitted successful! Hash: ${data.data.isTxComplete.transactionHash}`
        );
      })
      .finally(() => {
        setLoading(false);
        window.location.href = "/";
      });
    // const response = await post({
    //   url: process.env.NEXT_PUBLIC_SERVER_ENDPOINT + "/auth/register",
    //   body: {
    //     walletAddress: walletAddress,
    //     chainId: chainId,
    //     userType: "LISTENER",
    //   },
    // });
    // if (response.status !== "success") {
    //   console.log("Error creating user:", response);
    //   setLoading(false);
    //   return;
    // } else {
    //   createUser({
    //     name: values.name,
    //     displayName: values.displayName,
    //     username: values.username,
    //     userType: "LISTENER",
    //     country: values.country,
    //   }).then((user) => {
    //     // router.push("/auth/login");
    //     localStorage.clear();
    //     setLoading(false);
    //     window.location.href = "/auth/login";

    //     console.log("User created with transaction hash:", user);
    //   });
    // }
    // console.log(values);
  }
  return (
    <div className="flex flex-col items-center  mx-auto mt-8 text-white w-[55%] p-4">
      <h1 className="font-bold text-4xl mb-8">Sign up as a Listener</h1>
      <p className="text-medium text-gray-400 mb-8">
        Sign up now and get access to exclusive content
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-full text-large"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Michael Evans" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="Mickey J" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="mikej" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="nigeria">Nigeria</SelectItem>
                      <SelectItem value="USA">
                        United State of America
                      </SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-[#950944] text-white hover:bg-[#950944]/60"
            disabled={loading}
          >
            {loading ? "Creating Listener ..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RegisterListener;
