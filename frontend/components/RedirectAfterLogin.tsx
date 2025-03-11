"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
// import { useAuth } from "@/contexts/melodious/AuthContext";

const RedirectAfterLogin: React.FC = () => {
  return null;
  // const { userData, isAuthenticated } = useAuth();
  // const pathname = usePathname();
  // const router = useRouter();

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     if (userData) {
  //       // Get the current path to check if the user is already in the correct section
  //       const currentPath = pathname;

  //       // If the user is an artist and the current path is not the artist section, redirect to the artist section
  //       if (userData.artist && !currentPath.startsWith("/artist")) {
  //         // Ensure redirection to the artist section, either to the dashboard or other page
  //         router.push("/artist/dashboard");
  //       }
  //       // If the user is a listener and the current path is not the listener section, redirect to the listener section
  //       else if (userData.listener && !currentPath.startsWith("/listener")) {
  //         // Ensure redirection to the listener section, either to the dashboard or other page
  //         // router.push("/listener/dashboard");
  //         window.location.href = "/listener/dashboard";
  //       }
  //     }
  //   } else {
  //     // Redirect to the login page if the user is not authenticated
  //     router.push("/");
  //   }
  // }, [isAuthenticated, userData, router]);

  // return null;
};

export default RedirectAfterLogin;
