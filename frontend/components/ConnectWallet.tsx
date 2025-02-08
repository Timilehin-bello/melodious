import { client } from "@/lib/client";
import { ConnectButton } from "thirdweb/react";
import { LoginPayload, VerifyLoginPayloadParams } from "thirdweb/auth";

import { get, post } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useActiveWallet, useActiveAccount } from "thirdweb/react";
import { useEffect, useState } from "react";
import { defineChain } from "thirdweb";

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
  const [userData, setUserData] = useState<User | null>(null);

  const [successfulLogin, setSuccessfulLogin] = useState(false);

  useEffect(() => {
    if (successfulLogin && userData) {
      if (userData.listener === null) {
        // router.push("/artist/dashboard");
      } else if (userData.listener !== null) {
        // router.push("/listener/dashboard");
      } else if (userData.artist === null) {
        // router.push("/listener/dashboard");
      } else if (userData.artist !== null) {
        // router.push("/artist/dashboard");
      } else {
        router.push("/");
      }
    }
    console.log("successfulLogin", successfulLogin);
  }, [successfulLogin, router, userData]);
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
