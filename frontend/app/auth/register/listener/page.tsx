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
import { motion } from "framer-motion";
import { User, AtSign, MapPin, Music, Headphones, Gift } from "lucide-react";
import axios from "axios";
import { generateRandomLetter } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  username: z
    .string()
    .min(4)
    .regex(/^[a-zA-Z]+$/, {
      message:
        "Username must be at least 4 characters and can only contain letters.",
    }),
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters.",
  }),
  country: z.string({
    message: "You must select a country",
  }),
  referralCode: z.string().optional(),
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
      referralCode: "",
    },
  });

  const { connect, isConnecting } = useConnectModal();
  const handleConnect = useCallback(async () => {
    const wallet = await connect({ client: client }); // opens the connect modal
    console.log("connected to", wallet);
  }, [connect]);

  const checkUserIsRegistered = useCallback(async () => {
    const walletAddress = activeAccount?.address;
    const isUserRegistered = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/users/isRegistered?walletAddress=${walletAddress}`
    );
    return isUserRegistered.data;
  }, [activeAccount]);

  useEffect(() => {
    const walletAddress = activeAccount?.address;
    console.log("walletAddress", walletAddress);

    if (!walletAddress) {
      handleConnect().catch(() => {
        toast.error("Failed to connect to wallet. Please try again.");
      });
    }

    checkUserIsRegistered()
      .then((response) => {
        console.log("response checkUserIsRegistered", response);
        if (response.data) {
          toast.error("User already registered");
          localStorage.clear();
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
        }
      })
      .catch((error) => {
        console.log("error checkUserIsRegistered", error);
        toast.error("Failed to check user registration");
      });
  }, [activeAccount, handleConnect]);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const walletAddress = activeAccount?.address;
    const chainId = "31337";
    console.log("walletAddress", walletAddress);

    const isUserRegistered = createUser({
      name: values.name,
      displayName: values.displayName,
      username: values.username + generateRandomLetter(),
      userType: "LISTENER",
      country: values.country,
      referralCode: values.referralCode || undefined,
    })
      .then((data) => {
        // console.log("User created with transaction hash:", data);
        // router.push("/auth/login");
        localStorage.clear();
        setLoading(false);
        // window.location.href = "/auth/login";

        console.log("User created with transaction hash:");
        toast.success(`Transaction submitted successful`);
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
    <div className="min-h-screen relative">
      {/* <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-[#950944] relative"> */}
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5" />
      <div className="absolute inset-0 bg-gradient-radial from-[#950944]/20 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 container mx-auto px-4 py-12 min-h-screen flex items-center justify-center"
      >
        <div className="max-w-2xl w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#950944]/20 rounded-full flex items-center justify-center">
                <Headphones className="w-10 h-10 text-[#950944]" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent mb-4">
              Join as a Listener
            </h1>
            <p className="text-gray-400 text-lg">
              Discover amazing music and support your favorite artists
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl"
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Michael Evans"
                              {...field}
                              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#950944] transition-colors"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Display Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Mickey J"
                              {...field}
                              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#950944] transition-colors"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200 flex items-center gap-2">
                            <AtSign className="w-4 h-4" />
                            Username
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="mikej"
                              {...field}
                              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#950944] transition-colors"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Country
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select a country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-900 border-white/10 text-white">
                              <SelectItem value="nigeria">Nigeria</SelectItem>
                              <SelectItem value="USA">United States</SelectItem>
                              <SelectItem value="UK">United Kingdom</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Referral Code Section */}
                  <FormField
                    control={form.control}
                    name="referralCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200 flex items-center gap-2">
                          <Gift className="w-4 h-4" />
                          Referral Code (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter referral code from a friend"
                            {...field}
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#950944] transition-colors"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                        <p className="text-xs text-gray-400 mt-1">
                          Have a referral code? Enter it to earn bonus Melo
                          points!
                        </p>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="pt-4"
                >
                  <Button
                    type="submit"
                    className="w-full bg-[#950944] text-white hover:bg-[#950944]/80 transition-colors py-6 text-lg font-medium rounded-xl"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating Listener Account...
                      </div>
                    ) : (
                      "Create Listener Account"
                    )}
                  </Button>
                </motion.div>

                {/* Additional Info */}
                <p className="text-center text-gray-400 text-sm mt-6">
                  By creating an account, you agree to our Terms of Service and
                  Privacy Policy
                </p>
              </form>
            </Form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterListener;
