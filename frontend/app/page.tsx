"use client";
import { useEffect } from "react";
import { initializeSocket } from "@/lib/testSocket";
import Hero from "@/components/Hero";
import About from "@/components/About";
import ListenerSubscription from "@/components/ListenerSubscription";
import Trending from "@/components/Trending";
import FeaturedArtists from "@/components/FeaturedArtists";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";

export default function Home() {
  useEffect(() => {
    let data = localStorage.getItem("xx-mu") as any;
    data = JSON.parse(data) ?? null;
    const token = data ? data["tokens"]["token"].access.token : null;
    const socket = initializeSocket(token);

    socket.on("connect", () => {
      console.log("connected to socket successfully");
    });

    socket.on("connect_error", (error) => {
      console.log("error", error.message);
    });

    socket.on("unauthorized", (error) => {
      console.log("Unauthorized socket", error.message);
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (location.pathname === "/" && !localStorage.getItem("xx-mu")) {
        localStorage.clear();
      }
    };

    if (location.pathname === "/" && !localStorage.getItem("xx-mu")) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <>
      <Hero />
      <About />
      <HowItWorks />
      <Trending />
      <FeaturedArtists />
      <ListenerSubscription />
      <Footer />
    </>
  );
}
