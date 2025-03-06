"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerTrigger } from "./drawer";
import { useCart } from "@/lib/context/CartContext";
import { CartDrawerContent } from "./cart/CartDrawerContent";

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

// Add cart button component
interface CartButtonProps {
  onClick: () => void;
}

const CartButton = ({ onClick }: CartButtonProps) => {
  const pathname = usePathname();
  const { itemCount } = useCart();

  // Update condition to show cart on both store and product pages
  if (!pathname.startsWith("/store") && !pathname.startsWith("/product"))
    return null;

  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center w-8 h-8 md:w-[3.2rem] md:h-[3.2rem] rounded-full border border-black bg-white hover:bg-black hover:text-white transition-all duration-500"
    >
      {/* Cart SVG Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 md:w-6 md:h-6"
        fill="none"
        viewBox="0 0 33 30"
      >
        <path
          d="M1.94531 1.80127H7.27113L11.9244 18.602C12.2844 19.9016 13.4671 20.8013 14.8156 20.8013H25.6376C26.9423 20.8013 28.0974 19.958 28.495 18.7154L31.9453 7.9303H19.0041"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="13.4453" cy="27.3013" r="2.5" fill="currentColor" />
        <circle cx="26.4453" cy="27.3013" r="2.5" fill="currentColor" />
      </svg>

      {/* Cart Counter Badge */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-black text-white text-sm w-3.5 h-3.5 md:w-5 md:h-5 flex items-center justify-center rounded-full">
          {itemCount}
        </span>
      )}
    </button>
  );
};

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
  const { cartOpen, setCartOpen } = useCart();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 mb-6 flex justify-center gap-4 items-center",
        className
      )}
    >
      <NavGroup items={defaultWorkItems} />
      <NavGroup items={defaultUtilityItems} />
      <Drawer open={cartOpen} onOpenChange={setCartOpen}>
        <DrawerTrigger asChild>
          <CartButton onClick={() => setCartOpen(true)} />
        </DrawerTrigger>
        <DrawerContent>
          <CartDrawerContent />
        </DrawerContent>
      </Drawer>
    </nav>
  );
}
