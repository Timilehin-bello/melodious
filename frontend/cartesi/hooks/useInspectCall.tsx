import { ethers } from "ethers";
import configFile from "../config.json";
import { toHex } from "viem";
import { useState } from "react";
// import { errorAlert, successAlert } from '@/app/utils/customAlert';
import { useActiveWalletChain } from "thirdweb/react";
import toast from "react-hot-toast";

const config: any = configFile;

interface Report {
  payload: string;
}

export const useInspectCall = () => {
  const chain = useActiveWalletChain();
  const [inspectData, setInspectData] = useState<string>("");
  const [reports, setReports] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<any>({});
  const [decodedReports, setDecodedReports] = useState<any>({});

  const inspectCall = async (methodOrPath: string, param?: any) => {
    try {
      if (!chain) {
        return;
      }

      let apiURL = "";

      if (config[toHex(chain.id)]?.inspectAPIURL) {
        apiURL = `${config[toHex(chain.id)].inspectAPIURL}/inspect/${
          process.env.NEXT_PUBLIC_DAPP_ADDRESS
        }`;
      } else {
        console.log(
          `No inspect interface defined for chain ${toHex(chain.id)}`
        );
        return;
      }

      // Parse method and param from the input
      let method: string;
      let finalParam: any;

      if (methodOrPath.includes("/")) {
        // Split by '/' to extract method and param
        const parts = methodOrPath.split("/");
        method = parts[0];
        finalParam = parts.slice(1).join("/"); // Join remaining parts in case there are multiple '/'
      } else {
        // Use as method directly, with optional param
        method = methodOrPath;
        finalParam = param;
      }

      // Create request body with method and param
      const requestBody = {
        method: method,
        param: finalParam,
      };

      console.log("Request body:", requestBody);

      const response = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Response data:", data);

      setReports(data.reports);
      setMetadata({
        metadata: data.metadata,
        status: data.status,
        exception_payload: data.exception_payload,
      });

      // Decode payload from each report
      const decodedReports =
        data.reports?.map((report: Report) => {
          try {
            // Try to decode the hex payload to string
            const decodedString = ethers.utils.toUtf8String(report.payload);
            console.log("Decoded string:", decodedString);

            // Try to parse as JSON if possible
            try {
              console.log("Attempting to parse JSON:", decodedString);
              return JSON.parse(decodedString);
            } catch {
              console.log(
                "Failed to parse JSON, returning raw string:",
                decodedString
              );
              return decodedString;
            }
          } catch (error) {
            console.log("Error decoding payload:", error);
            return report.payload; // Return raw payload if decoding fails
          }
        }) || [];

      console.log("Decoded Reports:", decodedReports);
      setDecodedReports(decodedReports[0]);
      return decodedReports[0];
      // toast.success("Successfully fetched");
    } catch (error: any) {
      console.log("Error fetching inspect data:", error);
      toast.error("Failed to fetch");
    }
  };

  return {
    reports,
    metadata,
    setInspectData,
    inspectData,
    decodedReports,
    inspectCall,
  };
};
