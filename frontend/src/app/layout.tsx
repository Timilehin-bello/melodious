import localFont from "next/font/local";
import "./globals.css";
import HomeLayout from "@/components/HomeLayout";
// import MainLayout from "@/components/MainLayout";
// import { usePathname } from "next/navigation";
import { ThirdwebProvider } from "thirdweb/react";
import { Metadata } from "next";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Home | Melodious Music Platform",
  description: "Home Page of Melodious Music Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const pathname = usePathname();

  // // Conditional logic to choose layout
  // const isHomePage = pathname === "/";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <ThirdwebProvider>{children}</ThirdwebProvider>
      </body>
    </html>
  );
}
