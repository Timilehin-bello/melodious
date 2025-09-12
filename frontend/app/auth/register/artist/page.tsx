"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { motion } from "framer-motion";
import {
  Twitter,
  Instagram,
  Facebook,
  User,
  MapPin,
  AtSign,
  FileText,
  Gift,
} from "lucide-react";

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
  referralCode: z.string().optional(),
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
    // Do something with the form values.
    // const walletAddress = secureStorage.get("walletAddress");

    const walletAddress =
      activeAccount?.address || localStorage.getItem("walletAddress");

    // const chainId = "31337";
    // console.log(walletAddress);

    try {
      createUser({
        name: values.name,
        displayName: values.displayName,
        username: values.username + generateRandomLetter(),
        userType: "ARTIST",
        country: values.country,
        biography: values.biography,
        socialMediaLinks: {
          twitter: values.socialMediaLinks.twitter,
          instagram: values.socialMediaLinks.instagram,
          facebook: values.socialMediaLinks.facebook,
        },
        referralCode: values.referralCode,
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

          toast.success(`Transaction submitted successful`);
        })
        .finally(() => {
          setLoading(false);
          window.location.href = "/";
        })
        .catch((error) => {
          console.log(error);
          toast.error("Failed to create user. Please try again.");
        });
    } catch (error) {
      console.log(error);
      toast.error("Failed to create user. Please try again.");
    }

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
        className="relative z-10 container mx-auto px-4 py-12"
      >
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent mb-4">
              Sign up as an Artist
            </h1>
            <p className="text-gray-400 text-lg">
              Join our community and share your music with the world
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
                className="space-y-8"
              >
                {/* Basic Information Section */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Basic Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Name</FormLabel>
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
                          <FormLabel className="text-gray-200">
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
                          <FormLabel className="text-gray-200">
                            <span className="flex items-center gap-2">
                              <AtSign className="w-4 h-4" />
                              Username
                            </span>
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
                          <FormLabel className="text-gray-200">
                            <span className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Country
                            </span>
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
                </div>

                {/* Biography Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Biography
                  </h2>
                  <FormField
                    control={form.control}
                    name="biography"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your musical journey..."
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#950944] transition-colors min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Social Media Section */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white">
                    Social Media
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="socialMediaLinks.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">
                            <span className="flex items-center gap-2">
                              <Twitter className="w-4 h-4" />
                              Twitter
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://twitter.com/@handle"
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
                      name="socialMediaLinks.instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">
                            <span className="flex items-center gap-2">
                              <Instagram className="w-4 h-4" />
                              Instagram
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://instagram.com/@handle"
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
                      name="socialMediaLinks.facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">
                            <span className="flex items-center gap-2">
                              <Facebook className="w-4 h-4" />
                              Facebook
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://facebook.com/profile"
                              {...field}
                              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#950944] transition-colors"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Referral Code Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Referral Code (Optional)
                  </h2>
                  <FormField
                    control={form.control}
                    name="referralCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">
                          Referral Code
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter referral code if you have one"
                            {...field}
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#950944] transition-colors"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-[#950944] text-white hover:bg-[#950944]/80 transition-colors py-6 text-lg font-medium rounded-xl"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Creating Artist...
                      </div>
                    ) : (
                      "Create Artist Account"
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterArtist;
