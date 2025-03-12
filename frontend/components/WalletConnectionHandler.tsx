"use client";

import { useEffect } from "react";
import { useActiveWallet, useDisconnect } from "thirdweb/react";

export default function WalletConnectionHandler() {
  const wallet = useActiveWallet();
  const disconnect = useDisconnect();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const storedWallet = localStorage.getItem("thirdweb.wallet");

      if (!wallet && storedWallet) {
        console.warn("Corrupted Thirdweb session detected. Resetting...");
        localStorage.removeItem("thirdweb.wallet"); // Clear corrupted session
        // () => disconnect;
        window.location.reload(); // Reload to reset session
      }
    }, 5000); // Check after 5 seconds

    return () => clearTimeout(timeout);
  }, [wallet, disconnect]);

  return null; // No UI needed
}
