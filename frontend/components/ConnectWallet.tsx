import { client } from "@/lib/client";
import { ConnectButton } from "thirdweb/react";
import { LoginPayload, VerifyLoginPayloadParams } from "thirdweb/auth";

import { get, post } from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";
import { useActiveWallet, useActiveAccount } from "thirdweb/react";
import { useCallback, useEffect, useState } from "react";
import { defineChain } from "thirdweb";
import { useMelodiousContext } from "@/contexts/melodious";
import toast from "react-hot-toast";
import fetchMethod from "@/lib/readState";

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
  // const [userDetails, setUserDetails] = useState<any>({});

  const [successfulLogin, setSuccessfulLogin] = useState(false);

  const pathname = usePathname();

  const { userData, setUserData, isLoggedIn, checkLoginStatus } =
    useMelodiousContext();

  // Step 1: Ensure `checkLoginStatus` runs first and updates state
  useEffect(() => {
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

      if (user?.artist && !currentPath.startsWith("/artist")) {
        router.replace("/artist/dashboard");
      } else if (user?.listener && !currentPath.startsWith("/listener")) {
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
        chain={localhostChain}
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
              console.log("Error fetching login payload:", response);
              toast.error("User not found redirecting to register...");
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

            if (!response) {
              localStorage.clear();
              return false;
            }
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
              // router.refresh();
              // window.location.href = "/";
              window.location.replace("/");
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
