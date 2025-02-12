import { client } from "@/lib/client";
import { ConnectButton } from "thirdweb/react";
import { LoginPayload, VerifyLoginPayloadParams } from "thirdweb/auth";

import { get, post } from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";
import { useActiveWallet, useActiveAccount } from "thirdweb/react";
import { useEffect, useState } from "react";
import { defineChain } from "thirdweb";
import { useMelodiousContext } from "@/contexts/melodious";

export const localhostChain = defineChain({
  id: 31337,
  name: "localhost",
  rpc: "http://127.0.0.1:8545",
});

interface User {
  artist?: boolean;
  listener?: boolean;
  [key: string]: any;
}

const ConnectWallet = () => {
  const router = useRouter();
  // const [userData, setUserData] = useState<User | null>(null);

  const [successfulLogin, setSuccessfulLogin] = useState(false);

  const pathname = usePathname();

  // useEffect(() => {
  //   // if (successfulLogin && userData) {
  //   //   if (userData.listener === null) {
  //   //     // router.push("/artist/dashboard");
  //   //   } else if (userData.listener !== null) {
  //   //     // router.push("/listener/dashboard");
  //   //   } else if (userData.artist === null) {
  //   //     // router.push("/listener/dashboard");
  //   //   } else if (userData.artist !== null) {
  //   //     // router.push("/artist/dashboard");
  //   //   } else {
  //   //     router.push("/");
  //   //   }
  //   // }
  //   console.log("successfulLogin", successfulLogin);

  //   if (successfulLogin) {
  //     if (userData) {
  //       console.log("user data", userData);
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
  //         router.push("/listener/dashboard");
  //       }
  //     }
  //   } else {
  //     // Redirect to the login page if the user is not authenticated
  //     router.push("/");
  //   }
  // }, [router, userData]);

  const { userData, setUserData, isLoggedIn, checkLoginStatus } =
    useMelodiousContext();

  // Step 1: Ensure `checkLoginStatus` runs first and updates state
  useEffect(() => {
    const checkLogin = async () => {
      console.log("Checking login status..."); // Debug log
      const status = await checkLoginStatus();
      console.log("Login status:", status);

      // Redirect if login failed
      if (!status) {
        console.log("User not logged in, redirecting to home...");
        router.replace("/");
      }
    };

    checkLogin();
  }, []);

  // Step 2: Handle redirection after state updates
  useEffect(() => {
    if (isLoggedIn === null || userData === null) {
      console.log("Waiting for user data...");
      return;
    }

    console.log("User logged in:", isLoggedIn, "User data:", userData);

    handleRedirect(userData);
  }, [isLoggedIn, userData]);

  const handleRedirect = (user: User) => {
    const currentPath = pathname;

    if (user?.artist && !currentPath.startsWith("/artist")) {
      router.replace("/artist/dashboard");
    } else if (user?.listener && !currentPath.startsWith("/listener")) {
      router.replace("/listener/dashboard");
    }
  };
  return (
    <div>
      <ConnectButton
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
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/auth/login/request?walletAddress=${params.address}&chainId=31337`
            );

            if (!response.ok) {
              // throw new Error(`HTTP error! status: ${response.status}`);
              console.error("Error fetching login payload:", response);
            }
            localStorage.setItem("walletAddress", params.address);
            const request = await response.json();
            // console.log("getLoginPayload", request);
            if (request.status === "error") {
              router.push("/auth/register");
            }
            return request.data.payload;
          },
          /**
           * 	`doLogin` performs any logic necessary to log the user in using the signed payload.
           * 	In this case, this means sending the payload to the server for it to set a JWT cookie for the user.
           */
          doLogin: async (params: VerifyLoginPayloadParams) => {
            const response = await post({
              url: process.env.NEXT_PUBLIC_SERVER_ENDPOINT + "/auth/login",
              params,
            });

            localStorage.setItem("xx-mu", JSON.stringify(response.data));

            return response;
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

            const response = await get({
              url: process.env.NEXT_PUBLIC_SERVER_ENDPOINT + `/auth/isLoggedIn`,
              params: {
                accessToken: accessToken,
                thirdwebToken: thirdwebToken,
              },
            });
            setUserData(data.user);
            console.log("isLoggedIn", response);
            setSuccessfulLogin(response);

            console.log("successfulLogin", successfulLogin);
            return response;
          },
          /**
           * 	`doLogout` performs any logic necessary to log the user out.
           * 	In this case, this means sending a request to the server to clear the JWT cookie.
           */
          doLogout: async () => {
            let data = localStorage.getItem("xx-mu") as any | null;
            data = JSON.parse(data) ?? null;
            await fetch(
              process.env.NEXT_PUBLIC_SERVER_ENDPOINT + "/auth/logout",
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  accessToken: data["tokens"]["token"].access.token,
                }),
              }
            ).then(() => {
              localStorage.clear();
              // router.push("/");
              window.location.href = "/";
            });
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
