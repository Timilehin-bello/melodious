"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Music, Headphones } from "lucide-react";

const Register = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };
  //TODO:PLEASE DON'T FORGET TO ADD LATER bg-gradient-to-b from-black via-gray-900 to-[#950944]
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-[#950944]/20 via-transparent to-transparent" />

      {/* Main Content - Centered both vertically and horizontally */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-full max-w-6xl px-4 mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Section */}
          <motion.div
            className="text-center space-y-4 mb-12"
            variants={cardVariants}
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent">
              Get Access to Melodious
            </h1>
            <p className="text-lg md:text-xl text-gray-300">
              First, tell us who you are
            </p>
          </motion.div>

          {/* Cards Section */}
          <motion.div
            className="flex flex-col md:flex-row gap-6 md:gap-8 items-center justify-center"
            variants={containerVariants}
          >
            {/* Artist Card */}
            <motion.div
              variants={cardVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full md:w-[400px]"
            >
              <Link href="/auth/register/artist" className="block">
                <Card className="group relative h-[350px] bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#950944] transition-all duration-300">
                  <CardContent className="h-full flex flex-col items-center justify-center p-8">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 mb-8">
                      <div className="absolute inset-0 bg-[#950944] rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
                      <Music className="w-full h-full text-white p-6 group-hover:scale-110 transition-transform" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                      Artist
                    </h2>
                    <p className="text-gray-400 text-center">
                      Share your music with the world and connect with your fans
                    </p>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#950944] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Card>
              </Link>
            </motion.div>

            {/* Listener Card */}
            <motion.div
              variants={cardVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full md:w-[400px]"
            >
              <Link href="/auth/register/listener" className="block">
                <Card className="group relative h-[350px] bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#950944] transition-all duration-300">
                  <CardContent className="h-full flex flex-col items-center justify-center p-8">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 mb-8">
                      <div className="absolute inset-0 bg-[#950944] rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
                      <Headphones className="w-full h-full text-white p-6 group-hover:scale-110 transition-transform" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                      Listener
                    </h2>
                    <p className="text-gray-400 text-center">
                      Discover new music and support your favorite artists
                    </p>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#950944] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Card>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
