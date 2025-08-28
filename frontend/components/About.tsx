"use client";
import React from "react";
import Image from "next/image";

const About = () => {
  return (
    <section id="about" className="flex flex-wrap items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-16 md:py-20 px-4 md:px-12">
      <div className="w-full md:w-1/2 lg:w-1/3 flex justify-center mb-8 md:mb-0">
        <Image
          src="/images/landing/about_melodious.svg"
          width={500}
          height={500}
          alt="hero image"
          className="max-w-full h-auto"
        />
      </div>
      <div className="w-full md:w-1/2 lg:w-2/3 text-white text-center md:text-left md:pl-8 lg:pl-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
          About Melodious
        </h2>
        <p className="text-sm md:text-base lg:text-lg leading-relaxed max-w-prose mx-auto md:mx-0 text-gray-200">
          Melodious aims to capture the unique value proposition of a music
          streaming platform where artists earn based on listener playtime,

          while listeners earn through referrals and by supporting artists via
          a community rewards pool. This page will attract both listeners and
          artists, guiding each through their respective journeys, with CTAs
          at each step to ensure seamless navigation and comprehension of the
          benefits Melodious offers.
        </p>
      </div>
    </section>
  );
};

export default About;
