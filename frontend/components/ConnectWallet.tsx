import { client } from "@/lib/client";
import { ConnectButton } from "thirdweb/react";
import { LoginPayload, VerifyLoginPayloadParams } from "thirdweb/auth";

import { get, post } from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";
import { useActiveWallet, useActiveAccount } from "thirdweb/react";
import { useCallback, useEffect, useState } from "react";
import { defineChain } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { useMelodiousContext } from "@/contexts/melodious";
import toast from "react-hot-toast";
import fetchMethod from "@/lib/readState";
import axios from "axios";

export const networkChain =
  process.env.NEXT_PUBLIC_NODE_ENV === "development"
    ? defineChain({
        id: 31337,
        name: "localhost",
        rpc: "http://127.0.0.1:8545",
      })
    : baseSepolia;

interface User {
  artist?: boolean;
  listener?: boolean;
  [key: string]: any;
}

const ConnectWallet = () => {
  const router = useRouter();
  // const [userDetails, setUserDetails] = useState<any>({});

  const [successfulLogin, setSuccessfulLogin] = useState(false);
  const [previousWalletAddress, setPreviousWalletAddress] = useState<string | null>(null);

  const pathname = usePathname();
  const activeAccount = useActiveAccount();

  const { userData, setUserData, isLoggedIn, checkLoginStatus } =
    useMelodiousContext();

  // Extract logout logic into reusable function
  const performLogout = useCallback(async () => {
    let data = localStorage.getItem("xx-mu") as any | null;
    data = JSON.parse(data) ?? null;
    
    if (data && data["tokens"]) {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/auth/logout`,
          {
            accessToken: data["tokens"]["token"].access.token,
          },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        console.log("Error during logout:", error);
      }
    }
    
    localStorage.clear();
    setUserData(null);
    setPreviousWalletAddress(null);
    window.location.replace("/");
  }, [setUserData]);

  // Monitor wallet address changes
  useEffect(() => {
    const currentAddress = activeAccount?.address;
    
    // If there's no current address, reset previous address
    if (!currentAddress) {
      setPreviousWalletAddress(null);
      return;
    }

    // If this is the first time we're seeing an address, just store it
    if (previousWalletAddress === null) {
      setPreviousWalletAddress(currentAddress);
      return;
    }

    // If the address has changed and user is logged in, log them out
    if (previousWalletAddress !== currentAddress && isLoggedIn) {
      console.log("Wallet address changed, logging out user");
      toast.error("Wallet address changed. Please reconnect with the new wallet.");
      performLogout();
    } else if (previousWalletAddress !== currentAddress) {
      // Update the previous address even if not logged in
      setPreviousWalletAddress(currentAddress);
    }
  }, [activeAccount?.address, previousWalletAddress, isLoggedIn, performLogout]);

  // Step 1: Ensure `checkLoginStatus` runs first and updates state
  useEffect(() => {
    // console.log(
    //   "process.env.NEXT_PUBLIC_NODE_ENV:",
    //   process.env.NEXT_PUBLIC_NODE_ENV
    // );
    // console.log(
    //   "process.env.NEXT_PUBLIC_SERVER_ENDPOINT:",
    //   process.env.NEXT_PUBLIC_SERVER_ENDPOINT
    // );

    // console.log(
    //   "process.env.NEXT_PUBLIC_SOCKET_URL:",
    //   process.env.NEXT_PUBLIC_SOCKET_URL
    // );

    console.log("networkChain", networkChain);
    const checkLogin = async () => {
      console.log("Checking login status..."); // Debug log
      const status = await checkLoginStatus();
      console.log("Login status:", status);

      console.log("status:", status);

      // Redirect if login failed
      if (!status) {
        // toast.loading("Please connect your wallet to sign in or register", {
        //   duration: 3000,
        // });
        localStorage.clear();
        router.replace("/");
      }
    };

    checkLogin();
  }, []);

  const handleRedirect = useCallback(
    async (user: User) => {
      const currentPath = pathname;

      if (user?.artist && currentPath && !currentPath.startsWith("/artist")) {
        router.replace("/artist/dashboard");
      } else if (
        user?.listener &&
        currentPath &&
        !currentPath.startsWith("/listener")
      ) {
        // router.replace("/listener/dashboard");
        window.location.href = "/listener/dashboard";
      }
    },
    [pathname, router]
  );

  // Step 2: Handle redirection after state updates
  useEffect(() => {
    if (isLoggedIn === null || userData === null) {
      console.log("Waiting for user data...");
      return;
    }

    console.log("User logged in:", isLoggedIn, "User data:", userData);

    handleRedirect(userData);
  }, [isLoggedIn, userData, handleRedirect]);
  return (
    <div>
      <ConnectButton
        chain={networkChain}
        client={client}
        connectButton={{
          label: "Connect Wallet",
          className: "connect-button",
        }}
        auth={{
          /**
           * 	`getLoginPayload` should @return {VerifyLoginPayloadParams} object.
           * 	This can be generated on the server with the generatePayload method.
           */
          getLoginPayload: async (params: {
            address: string;
          }): Promise<LoginPayload> => {
            let response;

            try {
              response = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/auth/login/request`,
                {
                  params: {
                    walletAddress: params.address,
                    chainId: networkChain.id,
                  },
                }
              );
            } catch (err) {
              console.log("Error fetching login payload:", err);
              toast.error("User not found redirecting to register...");
              router.push("/auth/register");
              throw new Error("Failed to fetch login payload");
            }

            if (response && response.data) {
              localStorage.setItem("walletAddress", params.address);
              console.log("getLoginPayload last", response);
              return response.data.data.payload;
            } else {
              throw new Error(
                "Failed to fetch login payload: No payload received."
              );
            }
          },
          /**
           * 	`doLogin` performs any logic necessary to log the user in using the signed payload.
           * 	In this case, this means sending the payload to the server for it to set a JWT cookie for the user.
           */
          doLogin: async (params: VerifyLoginPayloadParams) => {
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/auth/login`,
              params
            );

            localStorage.setItem("xx-mu", JSON.stringify(response.data.data));

            return response.data.data;
          },
          /**
           * 	`isLoggedIn` returns true or false to signal if the user is logged in.
           * 	Here, this is done by calling the server to check if the user has a valid JWT cookie set.
           */
          isLoggedIn: async () => {
            let data = localStorage.getItem("xx-mu") as any | null;
            data = JSON.parse(data);
            const accessToken = data["tokens"]["token"].access.token;
            const thirdwebToken = data["tokens"]["token"].thirdWeb.token;

            // const response = await get({
            //   url: process.env.NEXT_PUBLIC_SERVER_ENDPOINT + `/auth/isLoggedIn`,
            //   params: {
            //     accessToken: accessToken,
            //     thirdwebToken: thirdwebToken,
            //   },
            // });
            const response = await axios.get(
              `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/auth/isLoggedIn`,
              {
                params: {
                  accessToken,
                  thirdwebToken,
                },
              }
            );

            if (response.data.status === "error") {
              localStorage.clear();
              return false;
            }
            setUserData(data.user);
            console.log("isLoggedIn", response.data.data);
            setSuccessfulLogin(response.data);

            console.log("successfulLogin", successfulLogin);
            return response.data.data;
          },
          /**
           * 	`doLogout` performs any logic necessary to log the user out.
           * 	In this case, this means sending a request to the server to clear the JWT cookie.
           */
          doLogout: async () => {
            await performLogout();
          },
        }}
      />
    </div>
  );
};

export default ConnectWallet;

// // components/ConnectWallet.tsx
// import React from "react";
// import { ConnectButton } from "thirdweb/react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/contexts/melodious/AuthContext";
// import { LoginPayload } from "thirdweb/auth";

// const ConnectWallet: React.FC = () => {
//   const { isAuthenticated, userData, loginWithWallet, logout } = useAuth();
//   const router = useRouter();

//   return (
//     <div>
//       <ConnectButton
//         client={client}
//         connectButton={{
//           label: "Connect Wallet",
//           className: "connect-button",
//         }}
//         auth={{
//           getLoginPayload: async (params: {
//             address: string;
//           }): Promise<any> => {
//             localStorage.setItem("walletAddress", params.address);
//             await loginWithWallet(params.address);
//           },
//           doLogin: async (params: any) => {
//             return params;
//           },
//           isLoggedIn: async () => {
//             return isAuthenticated;
//           },
//           doLogout: async () => {
//             await logout();
//           },
//         }}
//       />
//     </div>
//   );
// };

// export default ConnectWallet;
