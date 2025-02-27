"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";

interface NavItem {
  name: string;
  url: string;
}

// Custom hook for detecting visible section
const useVisibleSection = (items: NavItem[]) => {
  const [visibleSection, setVisibleSection] = useState<string>("");
  const pathname = usePathname();

  const isElementVisible = useCallback((element: Element) => {
    const rect = element.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;

    // Element is considered visible if it takes up a significant portion of the viewport
    const visibleRatio =
      Math.min(windowHeight, rect.bottom) - Math.max(0, rect.top);

    return visibleRatio > windowHeight * 0.3; // Element must take up 30% of viewport
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;

    const handleScroll = () => {
      // Get all section elements
      const sections = items
        .map((item) => item.url.split("#")[1])
        .filter(Boolean)
        .map((id) => document.getElementById(id))
        .filter((section): section is HTMLElement => section !== null);

      // Find the first visible section
      const visibleSection = sections.find((section) =>
        isElementVisible(section)
      );
      setVisibleSection(visibleSection ? "#" + visibleSection.id : "");
    };

    // Throttle scroll events
    let timeoutId: number | undefined;
    const throttledScroll = () => {
      if (timeoutId) return;
      timeoutId = window.setTimeout(() => {
        handleScroll();
        timeoutId = undefined;
      }, 100);
    };

    window.addEventListener("scroll", throttledScroll);
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener("scroll", throttledScroll);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [items, pathname, isElementVisible]);

  return visibleSection;
};

interface NavBarProps {
  items?: NavItem[];
  className?: string;
}

const defaultWorkItems: NavItem[] = [
  { name: "Web", url: "/#web" },
  { name: "Branding", url: "/#branding" },
  { name: "Photos", url: "/#photos" },
  { name: "Posters", url: "/#posters" },
];

const defaultUtilityItems: NavItem[] = [
  { name: "Blog", url: "/blog" },
  { name: "Store", url: "/store" },
];

const authItems: NavItem[] = [{ name: "Login", url: "/api/auth/signin" }];

const logoutItems: NavItem[] = [{ name: "Logout", url: "#logout" }];

interface TabProps {
  children: React.ReactNode;
  setPosition: (position: {
    left: number;
    width: number;
    opacity: number;
  }) => void;
  href: string;
  isActive: boolean;
}

const Tab = ({ children, setPosition, href, isActive }: TabProps) => {
  const ref = useRef<HTMLLIElement>(null);

  return (
    <Link href={href}>
      <li
        ref={ref}
        onMouseEnter={() => {
          if (!ref.current) return;
          const { width } = ref.current.getBoundingClientRect();
          setPosition({
            width,
            opacity: 1,
            left: ref.current.offsetLeft,
          });
        }}
        className={cn(
          "relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase text-white mix-blend-difference md:px-4 md:py-2 md:text-base",
          isActive && "underline underline-offset-4"
        )}
      >
        {children}
        {isActive && (
          <motion.div
            layoutId="active-pill"
            className="absolute inset-0 z-0 rounded-full bg-black/10"
          />
        )}
      </li>
    </Link>
  );
};

const Cursor = ({
  position,
}: {
  position: { left: number; width: number; opacity: number };
}) => {
  return (
    <motion.li
      animate={position}
      className="absolute z-0 h-7 rounded-full bg-black md:h-10"
    />
  );
};

interface NavGroupProps {
  items: NavItem[];
  className?: string;
}

const NavGroup = ({ items, className }: NavGroupProps) => {
  const pathname = usePathname();
  const activeSection = useVisibleSection(items);
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <ul
      className={cn(
        "relative flex w-fit rounded-full border border-black bg-white p-1",
        className
      )}
      onMouseLeave={() => setPosition((prev) => ({ ...prev, opacity: 0 }))}
    >
      {items.map((item) => (
        <Tab
          key={item.url}
          setPosition={setPosition}
          href={item.url}
          isActive={
            item.url.includes("#")
              ? pathname === "/" && activeSection === item.url.split("/").pop()
              : pathname === item.url
          }
        >
          {item.name}
        </Tab>
      ))}
      <Cursor position={position} />
    </ul>
  );
};

export function NavBar({ className }: Omit<NavBarProps, "items">) {
  const pathname = usePathname();
  const isStorePage = pathname.startsWith("/store");
  const { data: session, status } = useSession();
  const [logoutPosition, setLogoutPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut({ callbackUrl: "/store" });
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 mb-6 flex justify-center gap-4",
        className
      )}
    >
      <NavGroup items={defaultWorkItems} />
      <NavGroup items={defaultUtilityItems} />
      {isStorePage &&
        status !== "loading" &&
        (session ? (
          <ul
            className="relative flex w-fit rounded-full border border-black bg-white p-1"
            onMouseLeave={() =>
              setLogoutPosition((prev) => ({ ...prev, opacity: 0 }))
            }
          >
            <li
              onClick={handleLogout}
              onMouseEnter={(e) => {
                const { width } = e.currentTarget.getBoundingClientRect();
                setLogoutPosition({
                  width,
                  opacity: 1,
                  left: e.currentTarget.offsetLeft,
                });
              }}
              className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase text-white mix-blend-difference md:px-4 md:py-2 md:text-base"
            >
              Logout
            </li>
            <Cursor position={logoutPosition} />
          </ul>
        ) : (
          <NavGroup items={authItems} />
        ))}
    </nav>
  );
}
