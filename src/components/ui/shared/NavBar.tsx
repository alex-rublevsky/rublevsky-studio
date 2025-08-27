import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "~/utils/utils";
import { motion } from "motion/react";
import { Button } from "~/components/ui/shared/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/DropdownMenu";
import {
  IconDashboard,
  IconBox,
  IconArticle,
  IconCategory,
  IconBadgeTm,
  IconPackage,
  IconChartBar,
} from "@tabler/icons-react";
import { ArrowLeftFromLine, LogOutIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { signOut } from "~/utils/auth-client";
import { useNavigate } from "@tanstack/react-router";

interface NavItem {
  name: string;
  url: string;
  icon?: React.ComponentType;
}

const useVisibleSection = (items: NavItem[]) => {
  const [visibleSection, setVisibleSection] = useState("");
  const location = useRouter().state.location;

  const isElementVisible = useCallback((element: Element) => {
    const rect = element.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const visibleRatio =
      Math.min(windowHeight, rect.bottom) - Math.max(0, rect.top);
    return visibleRatio > windowHeight * 0.3;
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") return;

    const handleScroll = () => {
      const sections = items
        .map((item) => item.url.split("#")[1])
        .filter(Boolean)
        .map((id) => document.getElementById(id))
        .filter((section): section is HTMLElement => section !== null);

      const visibleSection = sections.find((section) =>
        isElementVisible(section)
      );
      setVisibleSection(visibleSection ? `#${visibleSection.id}` : "");
    };

    let timeoutId: number | undefined;
    const throttledScroll = () => {
      if (timeoutId) return;
      timeoutId = window.setTimeout(() => {
        handleScroll();
        timeoutId = undefined;
      }, 100);
    };

    window.addEventListener("scroll", throttledScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", throttledScroll);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [items, location.pathname, isElementVisible]);

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

const desktopMenuItems: NavItem[] = [
  { name: "Studio", url: "/" },
  { name: "Blog", url: "/blog" },
  { name: "Store", url: "/store" },
];

const mobileMenuItems: NavItem[] = [
  { name: "Studio", url: "/" },
  { name: "Blog", url: "/blog" },
  { name: "Store", url: "/store" },
  {
    name: "Resume",
    url: "https://assets.rublevsky.studio/PDF/Resume%20Alexander%20Rublevsky.pdf",
  },
];

// Dashboard navigation items
const dashboardNavItems: NavItem[] = [
  { name: "Dashboard", url: "/dashboard", icon: IconDashboard },
  { name: "Products", url: "/dashboard/products", icon: IconBox },
  { name: "Blog", url: "/dashboard/blog", icon: IconArticle },
  { name: "Categories", url: "/dashboard/categories", icon: IconCategory },
  { name: "Brands", url: "/dashboard/brands", icon: IconBadgeTm },
  { name: "Orders", url: "/dashboard/orders", icon: IconPackage },
  { name: "Analytics", url: "/dashboard/analytics", icon: IconChartBar },
];

const dashboardSecondaryItems: NavItem[] = [
  { name: "Back to Website", url: "/", icon: ArrowLeftFromLine },
];

const userData = {
  name: "Alexander",
  email: "alexander@rublevsky.studio",
  avatar: "me.jpg",
};

const DropdownNavMenu = ({ items, showUserInfo = false }: { items: NavItem[]; showUserInfo?: boolean }) => {
  const navigate = useNavigate();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex w-fit rounded-full border border-black bg-background hover:bg-black hover:text-white transition-all duration-300 p-[0.3rem] focus:outline-hidden focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
        <span className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs text-white mix-blend-difference md:px-4 md:py-2 md:text-sm">
          Menu
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        className="mb-2 rounded-2xl border border-black bg-background text-foreground"
      >
        {showUserInfo && (
          <>
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={`https://assets.rublevsky.studio/${userData.avatar}`} alt={userData.name} />
                <AvatarFallback className="rounded-lg">RA</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userData.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {userData.email}
                </span>
              </div>
            </div>
            <DropdownMenuItem 
              onClick={() => signOut({}, { onSuccess: () => navigate({ to: "/" }) })}
              className="flex items-center gap-2 py-2 px-3 text-sm hover:bg-black hover:text-white transition-colors duration-200 border-b border-gray-200"
            >
              <LogOutIcon className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </>
        )}
        {items.map((item) => (
          <DropdownMenuItem key={item.url} asChild>
            {item.url.startsWith("http") ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex w-full cursor-default select-none items-center py-2 px-3 text-sm outline-none focus:bg-black focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-black hover:text-white transition-colors duration-200"
              >
                {item.name}
              </a>
            ) : (
              <Link
                to={item.url}
                className="relative flex w-full cursor-default select-none items-center py-2 px-3 text-sm outline-none focus:bg-black focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-black hover:text-white transition-colors duration-200"
              >
                {item.name}
              </Link>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
    <Link to={href}>
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
          "relative z-10 block cursor-pointer px-2.5 md:px-4 py-1.5 text-xs  text-white mix-blend-difference md:py-2 md:text-sm",
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
      className="absolute z-0 h-7 rounded-full bg-black md:h-9"
    />
  );
};

interface NavGroupProps {
  items: NavItem[];
  className?: string;
}

const NavGroup = ({ items, className }: NavGroupProps) => {
  const router = useRouter();
  const pathname = router.state.location.pathname;
  const activeSection = useVisibleSection(items);
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <ul
      className={cn(
        "relative flex w-fit rounded-full border border-black bg-background p-[0.3rem]",
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

const GoBackButton = () => {
  return (
    <div className="absolute bottom-full mb-2 w-full rounded-full border border-black bg-background hover:bg-black hover:text-white transition-all duration-300 p-[0.3rem]">
      <Button asChild variant="outline" className="font-normal">
        <Link
          to="/"
          hash="#branding"
          className="relative z-10 block w-full text-center cursor-pointer px-3 py-1.5 text-xs text-white mix-blend-difference md:px-4 md:py-2 md:text-sm"
        >
          Go Back
        </Link>
      </Button>
    </div>
  );
};

const BackToBlogButton = () => {
  const navigate = useNavigate();
  const router = useRouter();
  
  const handleBackToBlog = () => {
    // Check if there's meaningful browser history (more than just the current page)
    if (window.history.length > 1) {
      // Try to use router's back navigation which should preserve scroll position
      // TanStack Router handles scroll restoration automatically when using router.history.back()
      router.history.back();
    } else {
      // Fallback to navigate to blog index if no history (direct URL access)
      navigate({ to: '/blog' });
    }
  };

  return (
    <div className="relative flex w-fit rounded-full border border-black bg-background hover:bg-black hover:text-white transition-all duration-300 p-[0.3rem]">
      <button
        onClick={handleBackToBlog}
        className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs text-white mix-blend-difference md:px-4 md:py-2 md:text-sm"
      >
        ← Back to blog
      </button>
    </div>
  );
};

export function NavBar({ className }: Omit<NavBarProps, "items">) {
  const router = useRouter();
  const routerState = useRouterState();
  const pathname = router.state.location.pathname;

  const showGoBackButton =
    routerState.location.pathname.startsWith("/branding/");

  const showBlogBackButton = 
    routerState.location.pathname.startsWith("/blog/") && 
    routerState.location.pathname !== "/blog";

  const isDashboard = routerState.location.pathname.startsWith("/dashboard");
  const showOther = !isDashboard;

  // Check if we should show the work sections (on homepage or branding detail pages)
  const showWorkSections =
    pathname === "/" || routerState.location.pathname.startsWith("/branding/");

  // Dashboard navigation layout
  if (isDashboard) {
    return (
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[40] mb-3 flex justify-center items-center px-3 pointer-events-none",
          className
        )}
      >
        {/* Dashboard secondary actions + main nav (left - mobile only) */}
        <div className="md:hidden absolute left-3 pointer-events-auto">
          <DropdownNavMenu items={[...dashboardSecondaryItems, ...dashboardNavItems]} showUserInfo={true} />
        </div>

        {/* Dashboard secondary actions (left - desktop only) */}
        <div className="hidden md:block absolute left-3 pointer-events-auto">
          <DropdownNavMenu items={dashboardSecondaryItems} showUserInfo={true} />
        </div>

        {/* Main dashboard navigation (center - desktop only) */}
        <div className="hidden md:block pointer-events-auto">
          <NavGroup items={dashboardNavItems} />
        </div>
      </nav>
    );
  }

  // Client-side navigation layout (existing logic)
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[40] mb-3 flex justify-start items-center px-3 pointer-events-none",
        className
      )}
    >
      {showWorkSections ? (
        <>
          <div className="hidden md:block pointer-events-auto">
            <DropdownNavMenu items={desktopMenuItems} />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:block pointer-events-auto">
            <div className="relative">
              {showGoBackButton && <GoBackButton />}
              <NavGroup items={defaultWorkItems} />
            </div>
          </div>
          <div className="md:hidden pointer-events-auto">
            <DropdownNavMenu items={mobileMenuItems} />
          </div>
          <div className="hidden md:block pointer-events-auto">
            <div className="relative flex w-fit rounded-full border border-black bg-background hover:bg-black hover:text-white transition-all duration-300 p-[0.3rem]">
              <button
                onClick={() => {
                  window.open(
                    "https://assets.rublevsky.studio/PDF/Resume%20Alexander%20Rublevsky.pdf?",
                    "_blank"
                  );
                }}
                className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs text-white mix-blend-difference md:px-4 md:py-2 md:text-sm"
              >
                Resume
              </button>
            </div>
          </div>
          <div className="md:hidden pointer-events-auto">
            <div className="relative">
              {showGoBackButton && <GoBackButton />}
              <NavGroup items={defaultWorkItems} />
            </div>
          </div>
        </>
      ) : showOther ? (
        <>
          {/* Desktop layout */}
          <div className="hidden md:flex items-center gap-3 pointer-events-auto">
            <DropdownNavMenu items={desktopMenuItems} />
            {showBlogBackButton && <BackToBlogButton />}
          </div>
          
          {/* Mobile layout */}
          <div className="md:hidden flex items-center gap-3 pointer-events-auto">
            <DropdownNavMenu items={mobileMenuItems} />
            {showBlogBackButton && <BackToBlogButton />}
          </div>
        </>
      ) : null}
    </nav>
  );
}
