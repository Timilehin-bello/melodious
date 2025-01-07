import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useActiveWalletConnectionStatus } from "thirdweb/react";

const useCheckUserData = () => {
  const [userData, setUserData] = useState<any | null>(null);
  const router = useRouter();
  const status = useActiveWalletConnectionStatus();

  useEffect(() => {
    const data = localStorage.getItem("xx-mu");
    if (data) {
      const parsedData = JSON.parse(data);
      setUserData(parsedData.user);

      if (parsedData.user.artist) {
        router.push("/artist/dashboard"); // Redirect to artist dashboard if artist data is found
      } else if (parsedData.user.listener) {
        router.push("/listener/dashboard"); // Redirect to listener dashboard if listener data is found
      } else {
        router.push("/"); // Redirect to login if no valid user data is found
      }
    } else {
      router.push("/"); // Redirect to login if no user data is found
    }
  }, [status]);

  return userData;
};

export default useCheckUserData;
