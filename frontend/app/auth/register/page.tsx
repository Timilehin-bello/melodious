import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Register = () => {
  return (
    <div className="text-white flex flex-col items-center space-y-8">
      <h1 className="text-5xl font-bold mb-4 mt-16">Get Access to Melodious</h1>
      <p className="mb-10 text-gray-300">First, tell us who you are</p>
      <div className="flex gap-4 items-center">
        <Link href="/auth/register/artist">
          <Card className="w-[300px] flex flex-col items-center bg-transparent hover:bg-pink-300 text-gray-300 hover:text-black">
            <CardContent>
              <Image
                src="/images/artist.svg"
                width={100}
                height={100}
                alt="Artist"
                className="rounded-full mt-16"
              />
            </CardContent>
            <CardFooter className="flex items-center">
              <h2 className="font-bold">Artist</h2>
            </CardFooter>
          </Card>
        </Link>
        <Link href="/auth/register/listener">
          <Card className="w-[300px] flex flex-col items-center bg-transparent hover:bg-pink-300 text-gray-300 hover:text-black">
            <CardContent>
              <Image
                src="/images/artist.svg"
                width={100}
                height={100}
                alt="Artist"
                className="rounded-full mt-16"
              />
            </CardContent>
            <CardFooter className="flex items-center">
              <h2 className="font-bold">Listener</h2>
            </CardFooter>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Register;
