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
import { Textarea } from "@/components/ui/textarea";
import { useMelodiousContext } from "@/contexts/melodious";
import { useRouter } from "next/navigation";
import { post } from "@/lib/api";
import { useActiveAccount, useConnectModal } from "thirdweb/react";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { client } from "@/lib/client";

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
  biography: z
    .string()
    .min(10, {
      message: "Bio must be at least 10 characters.",
    })
    .max(160, {
      message: "Bio must not be longer than 30 characters.",
    }),
  socialMediaLinks: z.object({
    twitter: z.string().url(),
    instagram: z.string().url(),
    facebook: z.string().url(),
  }),
});

const RegisterArtist = () => {
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
      biography: "",
      socialMediaLinks: {
        twitter: "",
        instagram: "",
        facebook: "",
      },
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
    // Do something with the form values.
    // const walletAddress = secureStorage.get("walletAddress");

    const walletAddress =
      activeAccount?.address || localStorage.getItem("walletAddress");

    // const chainId = "31337";
    // console.log(walletAddress);

    createUser({
      name: values.name,
      displayName: values.displayName,
      username: values.username,
      userType: "ARTIST",
      country: values.country,
      biography: values.biography,
      socialMediaLinks: {
        twitter: values.socialMediaLinks.twitter,
        instagram: values.socialMediaLinks.instagram,
        facebook: values.socialMediaLinks.facebook,
      },
    })
      .then((data) => {
        // console.log("User created with transaction hash:", data);
        // router.push("/auth/login");
        localStorage.clear();
        setLoading(false);
        // window.location.href = "/auth/login";

        console.log(
          "User created with transaction hash:",
          data.data.isTxComplete.transactionHash
        );
      })
      .finally(() => {
        setLoading(false);
        window.location.href = "/";
      });

    // console.log(values);
  }
  return (
    <div className="flex flex-col items-center  mx-auto mt-8 text-white w-[55%] p-4">
      <h1 className="font-bold text-4xl mb-8">Sign up as an Artist</h1>
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

          <FormField
            control={form.control}
            name="biography"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us a little bit about yourself"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <h2>Social Media Links</h2>
            <div className="flex flex-wrap gap-4 items-center">
              <FormField
                control={form.control}
                name="socialMediaLinks.twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter</FormLabel>
                    <FormControl>
                      <Input placeholder="https://x.com/@michael" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socialMediaLinks.instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://instagram.com/@michael"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socialMediaLinks.facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://facebook.com/michael"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#950944] text-white hover:bg-[#950944]/60"
            disabled={loading}
          >
            {loading ? "Creating Artist ..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RegisterArtist;
