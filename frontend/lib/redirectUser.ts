import { useRouter } from "next/navigation";

const redirectIfUserIsLoggedIn = () => {
  const router = useRouter();
  let data = localStorage.getItem("xx-mu") as any | null;
  data = JSON.parse(data);
  const artist = data.user.artist;
  const listener = data.user.listener;

  if (artist !== null) {
    router.push("/artist/dashboard");
  } else if (listener !== null) {
    router.push("/listener/dashboard");
  }
};

export default redirectIfUserIsLoggedIn;
