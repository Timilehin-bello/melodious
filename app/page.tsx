"use client";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const redirectToListener = () => {
    router.push("/listener/dashboard");
  };

  const redirectToArtist = () => {
    router.push("/artist/dashboard");
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-white">Home Page</h1>

      <div className="flex gap-4">
        <Button className="px-8 bg-red-400" onClick={redirectToArtist}>
          Artist
        </Button>
        <Button className="px-8 bg-red-400" onClick={redirectToListener}>
          Listener
        </Button>
      </div>
    </div>
  );
}
