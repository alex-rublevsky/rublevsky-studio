import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import React from "react";
import { cn } from "~/utils/utils";
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


interface NavBarProps {
  items?: NavItem[];
  className?: string;
}


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





interface SmartBackButtonProps {
  label: string;
  fallbackPath: string;
}

const SmartBackButton = ({ label, fallbackPath }: SmartBackButtonProps) => {
  const navigate = useNavigate();
  const router = useRouter();
  
  const handleBack = () => {
    // Check if there's meaningful browser history (more than just the current page)
    if (window.history.length > 1) {
      // Try to use router's back navigation which should preserve scroll position
      // TanStack Router handles scroll restoration automatically when using router.history.back()
      router.history.back();
    } else {
      // Fallback to navigate to specified path if no history (direct URL access)
      navigate({ to: fallbackPath });
    }
  };

  return (
    <div className="relative flex w-fit rounded-full border border-black bg-background hover:bg-black hover:text-white transition-all duration-300 p-[0.3rem]">
      <button
        onClick={handleBack}
        className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs text-white mix-blend-difference md:px-4 md:py-2 md:text-sm"
      >
        ← {label}
      </button>
    </div>
  );
};

export function NavBar({ className }: Omit<NavBarProps, "items">) {
  const router = useRouter();
  const routerState = useRouterState();
  const pathname = router.state.location.pathname;

  const showBlogBackButton = 
    routerState.location.pathname.startsWith("/blog/") && 
    routerState.location.pathname !== "/blog";

  const showStoreBackButton = 
    routerState.location.pathname.startsWith("/store/") && 
    routerState.location.pathname !== "/store";

  const showHomeBackButton = 
    pathname === "/web" || 
    pathname === "/photos" || 
    pathname === "/design" || 
    pathname === "/store" || 
    pathname === "/blog";

  const isDashboard = routerState.location.pathname.startsWith("/dashboard");
  const showOther = !isDashboard;

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
          <div className="flex w-fit rounded-full border border-black bg-background p-[0.3rem]">
            {dashboardNavItems.map((item) => (
              <Link
                key={item.url}
                to={item.url}
                className={cn(
                  "relative z-10 block cursor-pointer px-2.5 md:px-4 py-1.5 text-xs text-white mix-blend-difference md:py-2 md:text-sm rounded-full transition-colors",
                  pathname === item.url && "bg-black text-white mix-blend-normal"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
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
      {showOther ? (
        <>
          {/* Show SmartBackButton for blog pages - Desktop layout */}
          {showBlogBackButton && (
            <div className="hidden md:flex items-center gap-3 pointer-events-auto z-50">
              <SmartBackButton label="Back to blog" fallbackPath="/blog" />
            </div>
          )}
          
          {/* Show SmartBackButton for blog pages - Mobile layout */}
          {showBlogBackButton && (
            <div className="md:hidden flex items-center gap-3 pointer-events-auto z-50">
              <SmartBackButton label="Back to blog" fallbackPath="/blog" />
            </div>
          )}

          {/* Show SmartBackButton for product pages - Desktop layout */}
          {showStoreBackButton && (
            <div className="hidden md:flex items-center gap-3 pointer-events-auto z-50">
              <SmartBackButton label="Back to store" fallbackPath="/store" />
            </div>
          )}
          
          {/* Show SmartBackButton for product pages - Mobile layout */}
          {showStoreBackButton && (
            <div className="md:hidden flex items-center gap-3 pointer-events-auto z-50">
              <SmartBackButton label="Back to store" fallbackPath="/store" />
            </div>
          )}

          {/* Show SmartBackButton for index pages - Desktop layout */}
          {showHomeBackButton && (
            <div className="hidden md:flex items-center gap-3 pointer-events-auto z-50">
              <SmartBackButton label="Home" fallbackPath="/" />
            </div>
          )}
          
          {/* Show SmartBackButton for index pages - Mobile layout */}
          {showHomeBackButton && (
            <div className="md:hidden flex items-center gap-3 pointer-events-auto z-50">
              <SmartBackButton label="Home" fallbackPath="/" />
            </div>
          )}
        </>
      ) : null}
    </nav>
  );
}
