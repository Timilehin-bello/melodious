"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import Image from "next/image";

interface MenuItem {
  label: string;
  href: string;
  icon: string;
}

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Memoized menu items
  const menuItems = [
    { label: "Home", href: "/", icon: "/images/icons/home2.svg" },
    {
      label: "Playlist",
      href: "/playlist",
      icon: "/images/icons/playlist_icon.svg",
    },
    { label: "Artist", href: "/artist", icon: "/images/icons/musicplay.svg" },
    {
      label: "Explore",
      href: "/explore",
      icon: "/images/icons/headphone.svg",
    },
    {
      label: "Liked Songs",
      href: "/liked-songs",
      icon: "/images/icons/liked.svg",
    },
    {
      label: "Library",
      href: "/library",
      icon: "/images/icons/library.svg",
    },
  ];

  const secondMenuItems = useMemo<MenuItem[]>(
    () => [
      {
        label: "Settings",
        href: "/settings",
        icon: "/images/icons/setting2.svg",
      },
      {
        label: "Log Out",
        href: "/logout",
        icon: "/images/icons/musicnote.svg",
      },
    ],
    []
  );

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Icon */}
      {!isOpen ? (
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-[#20123C] text-white rounded"
        >
          <span className="sr-only">Open Sidebar</span>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      ) : (
        ""
      )}

      {/* Sidebar Drawer */}
      <div
        className={classNames(
          "lg:hidden fixed top-0 left-0 w-64 bg-cover bg-custom bg-center bg-no-repeat bg-[url('/images/sidebar_background.svg')] text-[#9B9B9B]  h-full z-20 transform transition-transform duration-300",
          {
            "-translate-x-full": !isOpen,
            "translate-x-0": isOpen,
          }
        )}
      >
        <button
          onClick={closeSidebar}
          className="absolute top-4 right-4 text-white"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-2xl mb-6 px-10 py-4">
          <Image
            src="/images/melodious_logo.svg"
            height={64}
            width={64}
            alt="Logo"
          />
        </h2>
        <nav>
          <ul>
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={classNames(
                    "flex gap-x-4 px-10 py-2 my-1",
                    pathname === item.href
                      ? "bg-[#12121275] text-white w-full border-r-4 border-red-500"
                      : "hover:bg-[#12121275]"
                  )}
                  onClick={closeSidebar}
                >
                  <Image
                    src={item.icon}
                    alt={item.label}
                    height={24}
                    width={24}
                  />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul>
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={classNames(
                    "flex gap-x-4 px-10 py-2 my-1",
                    pathname === item.href
                      ? "bg-[#12121275] text-white w-full border-r-4 border-red-500"
                      : "hover:bg-[#12121275]"
                  )}
                  onClick={closeSidebar}
                >
                  <Image
                    src={item.icon}
                    alt={item.label}
                    height={24}
                    width={24}
                  />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Full Sidebar for Large Screens */}
      <aside className="hidden lg:block lg:w-64 bg-cover bg-custom bg-right bg-no-repeat bg-[url('/images/sidebar_background.svg')] text-[#9B9B9B] h-full min-h-screen lg:bg-cover bg-scroll z-10 overflow-y-auto no-scrollbar">
        <div
          className="absolute inset-0 bg-gradient-to-tr from-[#20123C] to-black/20 opacity-30 pointer-events-none"
          aria-hidden="true"
        ></div>
        <Link href="/" className="text-2xl mb-6 px-6 py-7 flex gap-x-2">
          <Image
            src="/images/melodious_logo.svg"
            height={64}
            width={64}
            alt="Logo"
          />
          <Image
            src="/images/melodious_text.svg"
            height={64}
            width={137}
            alt="Logo Text"
          />
        </Link>
        <nav>
          <h2 className="text-xl px-10 py-1 text-white">Menu</h2>
          <ul>
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={classNames(
                    "flex gap-x-4 px-10 py-2 my-1",
                    pathname === item.href
                      ? "bg-[#12121275] text-white w-full border-r-4 border-red-500"
                      : "hover:bg-[#12121275] hover:text-white hover:transition"
                  )}
                >
                  <Image
                    src={item.icon}
                    alt={item.label}
                    height={24}
                    width={24}
                  />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav>
          <h2 className="text-xl px-10 py-1 text-white mt-16">Others</h2>
          <ul>
            {secondMenuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={classNames(
                    "flex gap-x-4 px-10 py-2 my-1",
                    pathname === item.href
                      ? "bg-[#12121275] text-white w-full border-r-4 border-red-500"
                      : "hover:bg-[#12121275] hover:text-white"
                  )}
                >
                  <Image
                    src={item.icon}
                    alt={item.label}
                    height={24}
                    width={24}
                  />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="lg:hidden fixed inset-0 bg-black opacity-50 z-10"
        ></div>
      )}
    </>
  );
};

export default Sidebar;
