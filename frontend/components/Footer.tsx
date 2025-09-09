"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Image
              src="/images/melodious_full_logo.svg"
              width={200}
              height={50}
              alt="melodious logo"
            />
            <p className="mt-4">
              Stream music, support artists, and earn rewards.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul>
              <li>
                <Link href="">Home</Link>
              </li>
              <li>
                <Link href="">About Us</Link>
              </li>
              <li>
                <Link href="">Pricing</Link>
              </li>
              <li>
                <Link href="">FAQs</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Community</h3>
            <ul>
              <li>
                <Link href="">Discord</Link>
              </li>
              <li>
                <Link href="">Twitter</Link>
              </li>
              <li>
                <Link href="">Telegram</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Legal</h3>
            <ul>
              <li>
                <Link href="">Terms of Service</Link>
              </li>
              <li>
                <Link href="">Privacy Policy</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-8">
          <p>&copy; 2024 Melodious. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
