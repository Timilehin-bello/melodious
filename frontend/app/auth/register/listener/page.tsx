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
import { useActiveAccount } from "thirdweb/react";

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

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const walletAddress = activeAccount?.address;
    const chainId = "31337";
    console.log("walletAddress", walletAddress);
    const response = await post({
      url: process.env.NEXT_PUBLIC_SERVER_ENDPOINT + "/auth/register",
      body: {
        walletAddress: walletAddress,
        chainId: chainId,
        userType: "LISTENER",
      },
    });
    if (response.status !== "success") {
      console.error("Error creating user:", response);
      return;
    } else {
      createUser({
        name: values.name,
        displayName: values.displayName,
        username: values.username,
        userType: "LISTENER",
        country: values.country,
      }).then((user) => {
        // router.push("/auth/login");
        localStorage.clear();
        window.location.href = "/auth/login";

        console.log("User created with transaction hash:", user);
      });
    }
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
          >
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RegisterListener;
