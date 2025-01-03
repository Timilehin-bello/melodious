import { get, post } from "@/lib/api";
import { client } from "@/lib/client";
import { LoginPayload, VerifyLoginPayloadParams } from "thirdweb/auth";
import { ConnectButton } from "thirdweb/react";

const ConnectButtonAuth = () => {
  return (
    <div>
      <ConnectButton
        client={client}
        connectButton={{
          label: "Connect Wallet",
          className: "connect-button",
        }}
        // auth={{
        //   /**
        //    * 	`getLoginPayload` should @return {VerifyLoginPayloadParams} object.
        //    * 	This can be generated on the server with the generatePayload method.
        //    */
        //   getLoginPayload: async (params: {
        //     address: string;
        //   }): Promise<LoginPayload> => {
        //     // console.log("chainId", params);
        //     const request = await get({
        //       url:
        //         process.env.NEXT_PUBLIC_SERVER_ENDPOINT + "/auth/login/request",
        //       params: {
        //         walletAddress: params.address,
        //         chainId: 31337,
        //       },
        //     });
        //     // console.log("request", request);
        //     // if (request.code === 404) {
        //     //   router.push("/register");
        //     // }
        //     console.log("getLoginPayload", request);
        //     return request;
        //   },
        //   /**
        //    * 	`doLogin` performs any logic necessary to log the user in using the signed payload.
        //    * 	In this case, this means sending the payload to the server for it to set a JWT cookie for the user.
        //    */
        //   doLogin: async (params: VerifyLoginPayloadParams) => {
        //     const response = await post({
        //       url: process.env.NEXT_PUBLIC_SERVER_ENDPOINT + "/auth/login",
        //       params,
        //     });
        //     if (response.data["status"] === "success") {
        //       localStorage.setItem(
        //         "accessToken",
        //         response.data["data"]["accessToken"]
        //       );
        //       localStorage.setItem(
        //         "thirdwebToken",
        //         response.data["data"]["thirdwebToken"]
        //       );
        //     }
        //     return response;
        //   },
        //   /**
        //    * 	`isLoggedIn` returns true or false to signal if the user is logged in.
        //    * 	Here, this is done by calling the server to check if the user has a valid JWT cookie set.
        //    */
        //   isLoggedIn: async () => {
        //     const accessToken = localStorage.getItem("accessToken");
        //     const thirdwebToken = localStorage.getItem("thirdwebToken");
        //     // const response = await get({
        //     //   url: process.env.NEXT_PUBLIC_SERVER_ENDPOINT + `/auth/isLoggedIn`,
        //     //   params: {
        //     //     accessToken: accessToken,
        //     //     // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTczNTU3MTQ2OSwiZXhwIjoxNzM1NjU3ODY5LCJ0eXBlIjoiQUNDRVNTIn0.XhYfK1P2hIR5zyrdNCCDeVLMZ1RCiy0hYulA46fIS0U",
        //     //     thirdwebToken: thirdwebToken,
        //     //     // "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIweDI3ODUyMzMyMzRlNzg4MEE1ZTNiM2ZDNTU3NEFhZjVCMTJEN2M2OGYiLCJzdWIiOiIweGYzOUZkNmU1MWFhZDg4RjZGNGNlNmFCODgyNzI3OWNmZkZiOTIyNjYiLCJhdWQiOiJsb2NhbGhvc3Q6NTE3MyIsImV4cCI6MTczNTY1Nzg2OCwibmJmIjoxNzM1NTcwODY1LCJpYXQiOjE3MzU1NzE0NjksImp0aSI6IjB4Zjk0YThiNzM2NmFiMTJjOGE1MzlmMjkyYjVjYzg3ZWJiZjZkMmU4ODM0MDJmNTc5M2YxYzcxYzU2OGM3N2NkZCIsImN0eCI6e319.MHgwMDFiNzA0ZDFhNWY2NDNiYmYyMzI1YWM2YjY2MjJjYjliNmUyNTU2MmZhYjgyNDFjZTdiYzQ4N2UzYWZmMzExMmJiNzcxNDJiNTg1NzllMGExM2IyYmUwN2I0MTUyMDZmZGUzYTU5NjBkYzBlNTRiMzFmNTczNzM1MmMxNWQxNzFj",
        //     //   },
        //     // });

        //     // console.log("isLoggedIn", response);

        //     // if (response === false) {
        //     //   router.push("/register");
        //     // } else {
        //     //   return response;
        //     // }
        //     return await get({
        //       url: process.env.NEXT_PUBLIC_SERVER_ENDPOINT + `/auth/isLoggedIn`,
        //       params: {
        //         accessToken: accessToken,
        //         // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTczNTU3MTQ2OSwiZXhwIjoxNzM1NjU3ODY5LCJ0eXBlIjoiQUNDRVNTIn0.XhYfK1P2hIR5zyrdNCCDeVLMZ1RCiy0hYulA46fIS0U",
        //         thirdwebToken: thirdwebToken,
        //         // "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIweDI3ODUyMzMyMzRlNzg4MEE1ZTNiM2ZDNTU3NEFhZjVCMTJEN2M2OGYiLCJzdWIiOiIweGYzOUZkNmU1MWFhZDg4RjZGNGNlNmFCODgyNzI3OWNmZkZiOTIyNjYiLCJhdWQiOiJsb2NhbGhvc3Q6NTE3MyIsImV4cCI6MTczNTY1Nzg2OCwibmJmIjoxNzM1NTcwODY1LCJpYXQiOjE3MzU1NzE0NjksImp0aSI6IjB4Zjk0YThiNzM2NmFiMTJjOGE1MzlmMjkyYjVjYzg3ZWJiZjZkMmU4ODM0MDJmNTc5M2YxYzcxYzU2OGM3N2NkZCIsImN0eCI6e319.MHgwMDFiNzA0ZDFhNWY2NDNiYmYyMzI1YWM2YjY2MjJjYjliNmUyNTU2MmZhYjgyNDFjZTdiYzQ4N2UzYWZmMzExMmJiNzcxNDJiNTg1NzllMGExM2IyYmUwN2I0MTUyMDZmZGUzYTU5NjBkYzBlNTRiMzFmNTczNzM1MmMxNWQxNzFj",
        //       },
        //     });
        //   },
        //   /**
        //    * 	`doLogout` performs any logic necessary to log the user out.
        //    * 	In this case, this means sending a request to the server to clear the JWT cookie.
        //    */
        //   doLogout: async () => {
        //     await post({
        //       url: process.env.NEXT_PUBLIC_SERVER_ENDPOINT + "/auth/logout",
        //     });
        //   },
        // }}
      />
    </div>
  );
};

export default ConnectButtonAuth;
