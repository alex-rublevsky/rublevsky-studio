import {
	IconArticle,
	IconBadgeTm,
	IconCategory,
	IconChartBar,
	IconDashboard,
	IconPackage,
} from "@tabler/icons-react";
import {
	Link,
	useNavigate,
	useRouter,
	useRouterState,
} from "@tanstack/react-router";
import { ArrowLeftFromLine, LogOutIcon, Plus, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/DropdownMenu";
import { Button } from "~/components/ui/shared/Button";
import { InstagramIcon, TelegramIcon } from "~/components/ui/shared/Icons";
import { INSTAGRAM_URL, TELEGRAM_CHANNEL_URL } from "~/constants/urls";
import { usePrefetch } from "~/hooks/usePrefetch";
import { signOut } from "~/utils/auth-client";
import { cn } from "~/utils/utils";

interface NavItem {
	name: string;
	url: string;
	icon?: React.ComponentType;
}

interface NavBarProps {
	items?: NavItem[];
	className?: string;
	userData?: {
		userID: string;
		userName: string;
		userEmail: string;
		userAvatar: string;
	};
	onActionClick?: () => void;
}

// Dashboard navigation items
const dashboardNavItems: NavItem[] = [
	{ name: "Dashboard", url: "/dashboard/", icon: IconDashboard },
	{ name: "Blog", url: "/dashboard/blog", icon: IconArticle },
	{ name: "Categories", url: "/dashboard/categories", icon: IconCategory },
	{ name: "Brands", url: "/dashboard/brands", icon: IconBadgeTm },
	{ name: "Orders", url: "/dashboard/orders", icon: IconPackage },
	{ name: "Analytics", url: "/dashboard/analytics", icon: IconChartBar },
];

const dashboardSecondaryItems: NavItem[] = [
	{ name: "Back to Website", url: "/", icon: ArrowLeftFromLine },
];

const DropdownNavMenu = ({
	items,
	showUserInfo = false,
	userData,
}: {
	items: NavItem[];
	showUserInfo?: boolean;
	userData?: {
		userID: string;
		userName: string;
		userEmail: string;
		userAvatar: string;
	};
}) => {
	const navigate = useNavigate();

	const userID = userData?.userID || "";
	const userName = userData?.userName || "";
	const userEmail = userData?.userEmail || "";
	const userAvatar = userData?.userAvatar || "";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="relative flex w-fit rounded-full border border-black bg-background hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground transition-all duration-300 p-[0.3rem] focus:outline-hidden focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
				<span className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs text-primary-foreground mix-blend-difference md:px-4 md:py-2 md:text-sm">
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
						<div className="flex items-center gap-2 px-3 py-2 border-b border-border">
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={userAvatar} alt={userName || userID} />
								<AvatarFallback className="rounded-lg">
									{userName ? userName.charAt(0).toUpperCase() : "U"}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">
									{userName || userID}
								</span>
								<span className="truncate text-xs text-muted-foreground">
									{userEmail}
								</span>
							</div>
						</div>
						<DropdownMenuItem
							onClick={async () => {
								try {
									const _result = await signOut();

									// Clear any local storage or cached data
									localStorage.clear();
									sessionStorage.clear();

									// Force a page reload to clear any cached state and ensure clean logout
									window.location.href = "/";
								} catch (error) {
									console.error("Logout failed", error);

									// Clear local storage even if signOut fails
									localStorage.clear();
									sessionStorage.clear();

									// Fallback to navigation if signOut fails
									navigate({ to: "/" });
								}
							}}
							className="flex items-center gap-2 py-2 px-3 text-sm hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground transition-colors duration-200 border-b border-border"
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
								className="relative flex w-full cursor-default select-none items-center py-2 px-3 text-sm outline-none focus:bg-primary focus:text-primary-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground transition-colors duration-200"
							>
								{item.name}
							</a>
						) : (
							<Link
								to={item.url}
								className="relative flex w-full cursor-default select-none items-center py-2 px-3 text-sm outline-none focus:bg-primary focus:text-primary-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground transition-colors duration-200"
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
	isCloseMode?: boolean;
	onClose?: () => void;
}

const SmartBackButton = ({
	label,
	fallbackPath,
	isCloseMode = false,
	onClose,
}: SmartBackButtonProps) => {
	const navigate = useNavigate();
	const router = useRouter();

	const handleClick = () => {
		if (isCloseMode && onClose) {
			onClose();
		} else {
			// Try to detect if we have meaningful navigation history by checking document.referrer
			// document.referrer is empty when opening via direct link, bookmark, or new tab
			const hasReferrer = document.referrer && document.referrer !== "";
			const referrerIsSameSite =
				hasReferrer &&
				new URL(document.referrer).origin === window.location.origin;

			// If we have same-site referrer and browser history, try going back
			if (referrerIsSameSite && window.history.length > 1) {
				// Use router's back navigation for proper scroll restoration
				router.history.back();
			} else {
				// No referrer or external referrer - navigate directly to fallback
				navigate({ to: fallbackPath });
			}
		}
	};

	return (
		<div className="relative flex w-fit rounded-full border border-black bg-background hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground transition-all duration-300 p-[0.3rem]">
			<button
				type="button"
				onClick={handleClick}
				className="relative z-10 flex items-center gap-2 cursor-pointer px-3 py-1.5 text-xs text-primary-foreground mix-blend-difference md:px-4 md:py-2 md:text-sm"
			>
				{isCloseMode ? (
					<>
						<X className="h-4 w-4" />
						{label}
					</>
				) : (
					<>← {label}</>
				)}
			</button>
		</div>
	);
};

export function NavBar({
	className,
	userData,
	onActionClick,
}: Omit<NavBarProps, "items">) {
	const router = useRouter();
	const routerState = useRouterState();
	const pathname = router.state.location.pathname;
	const { prefetchBlog, prefetchStore, prefetchDashboardOrders } =
		usePrefetch();

	// Check if branding modal is open
	const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);

	useEffect(() => {
		const checkModalState = () => {
			setIsBrandingModalOpen(
				document.body.getAttribute("data-branding-modal-open") === "true",
			);
		};

		// Check initial state
		checkModalState();

		// Watch for changes using MutationObserver
		const observer = new MutationObserver(checkModalState);
		observer.observe(document.body, {
			attributes: true,
			attributeFilter: ["data-branding-modal-open"],
		});

		return () => observer.disconnect();
	}, []);

	// Keep NavBar silent in production; no-op logs

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
		pathname === "/blog" ||
		pathname === "/about";

	// Handle closing branding modal from NavBar
	const handleCloseBrandingModal = () => {
		window.dispatchEvent(new CustomEvent("close-branding-modal"));
	};

	const isDashboard = routerState.location.pathname.startsWith("/dashboard");
	const showOther = !isDashboard;

	// Configure action button based on current route
	const getActionButton = () => {
		if (pathname === "/dashboard/" || pathname === "/dashboard") {
			return {
				label: "Add Product",
				onClick: onActionClick,
			};
		}
		if (pathname === "/dashboard/blog") {
			return {
				label: "Add Post",
				onClick: onActionClick,
			};
		}
		return null;
	};

	const actionButton = getActionButton();

	// Dashboard navigation layout
	if (isDashboard) {
		return (
			<nav
				className={cn(
					"fixed bottom-0 left-0 right-0 z-[9999] mb-3 px-3 pointer-events-none",
					className,
				)}
				style={{
					viewTransitionName: "navbar", // Isolate navbar from page transitions
				}}
			>
				{/* Mobile: Stack menu and action button */}
				<div className="xl:hidden flex justify-between items-center gap-2 pointer-events-auto">
					<DropdownNavMenu
						items={[...dashboardSecondaryItems, ...dashboardNavItems]}
						showUserInfo={true}
						userData={userData}
					/>
					{actionButton && (
						<button
							type="button"
							onClick={actionButton.onClick}
							className="relative flex w-fit rounded-full border border-black bg-primary text-primary-foreground hover:bg-background hover:text-foreground transition-all duration-300 p-[0.3rem] focus:outline-hidden focus:ring-1 focus:ring-ring whitespace-nowrap"
						>
							<span className="relative z-10 flex items-center gap-1.5 cursor-pointer px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm">
								<Plus className="w-4 h-4" />
								{actionButton.label}
							</span>
						</button>
					)}
				</div>

				{/* Desktop: Full width flex with space-between */}
				<div className="hidden xl:flex items-center justify-between gap-2 w-full pointer-events-auto">
					{/* Left: Menu dropdown */}
					<DropdownNavMenu
						items={dashboardSecondaryItems}
						showUserInfo={true}
						userData={userData}
					/>

					{/* Center: Page navigation tabs */}
					<div className="flex w-fit rounded-full border border-primary bg-background p-[0.3rem]">
						{dashboardNavItems.map((item) => (
							<Link
								key={item.url}
								to={item.url}
								onMouseEnter={() => {
									// Prefetch orders data on hover
									if (item.url === "/dashboard/orders") {
										prefetchDashboardOrders();
									}
								}}
								className={cn(
									"relative z-10 block cursor-pointer px-3 xl:px-4 py-1.5 text-xs text-primary-foreground mix-blend-difference xl:py-2 xl:text-sm rounded-full transition-colors",
									pathname === item.url &&
										"bg-primary text-primary-foreground mix-blend-normal",
								)}
							>
								{item.name}
							</Link>
						))}
					</div>

					{/* Right: Action button */}
					{actionButton ? (
						<button
							type="button"
							onClick={actionButton.onClick}
							className="relative flex w-fit rounded-full border border-primary bg-primary text-primary-foreground hover:bg-background hover:text-foreground transition-all duration-300 p-[0.3rem] focus:outline-hidden focus:ring-1 focus:ring-ring whitespace-nowrap"
						>
							<span className="relative z-10 flex items-center gap-1.5 cursor-pointer px-3 py-1.5 text-xs xl:px-4 xl:py-2 xl:text-sm">
								<Plus className="w-4 h-4" />
								{actionButton.label}
							</span>
						</button>
					) : (
						// Placeholder to maintain spacing when no action button
						<div className="w-[120px]" />
					)}
				</div>
			</nav>
		);
	}

	// Client-side navigation layout (existing logic)
	return (
		<nav
			className={cn(
				"fixed bottom-0 left-0 right-0 z-[9999] mb-3 flex justify-between items-center px-3 pointer-events-none",
				className,
			)}
			style={{
				viewTransitionName: "navbar", // Isolate navbar from page transitions
			}}
		>
			{showOther ? (
				<>
					<div className="flex items-center gap-3">
						{/* Show SmartBackButton for blog pages - Desktop layout */}
						{showBlogBackButton && (
							<button
								type="button"
								className="hidden md:flex items-center gap-3 pointer-events-auto z-50 bg-transparent border-0 p-0 motion-translate-y-in-20 motion-blur-in-md motion-opacity-in-0 motion-delay-[100ms]"
								onMouseEnter={prefetchBlog}
								onClick={() => {}}
							>
								<SmartBackButton label="Back to blog" fallbackPath="/blog" />
							</button>
						)}

						{/* Show SmartBackButton for blog pages - Mobile layout */}
						{showBlogBackButton && (
							<div className="md:hidden flex items-center gap-3 pointer-events-auto z-50 motion-translate-y-in-20 motion-blur-in-md motion-opacity-in-0 motion-delay-[100ms]">
								<SmartBackButton label="Back to blog" fallbackPath="/blog" />
							</div>
						)}

						{/* Show SmartBackButton for product pages - Desktop layout */}
						{showStoreBackButton && (
							<button
								type="button"
								className="hidden md:flex items-center gap-3 pointer-events-auto z-50 bg-transparent border-0 p-0 motion-translate-y-in-20 motion-blur-in-md motion-opacity-in-0 motion-delay-[100ms]"
								onMouseEnter={prefetchStore}
								onClick={() => {}}
							>
								<SmartBackButton label="Back to store" fallbackPath="/store" />
							</button>
						)}

						{/* Show SmartBackButton for product pages - Mobile layout */}
						{showStoreBackButton && (
							<div className="md:hidden flex items-center gap-3 pointer-events-auto z-50 motion-translate-y-in-20 motion-blur-in-md motion-opacity-in-0 motion-delay-[100ms]">
								<SmartBackButton label="Back to store" fallbackPath="/store" />
							</div>
						)}

						{/* Show SmartBackButton for index pages - Desktop layout */}
						{showHomeBackButton && (
							<div className="hidden md:flex items-center gap-3 pointer-events-auto z-50 motion-translate-y-in-20 motion-blur-in-md motion-opacity-in-0 motion-delay-[100ms]">
								<SmartBackButton
									label={isBrandingModalOpen ? "Close project" : "Home"}
									fallbackPath="/"
									isCloseMode={isBrandingModalOpen}
									onClose={handleCloseBrandingModal}
								/>
							</div>
						)}

						{/* Show SmartBackButton for index pages - Mobile layout */}
						{showHomeBackButton && (
							<div className="md:hidden flex items-center gap-3 pointer-events-auto z-50 motion-translate-y-in-20 motion-blur-in-md motion-opacity-in-0 motion-delay-[100ms]">
								<SmartBackButton
									label={isBrandingModalOpen ? "Close project" : "Home"}
									fallbackPath="/"
									isCloseMode={isBrandingModalOpen}
									onClose={handleCloseBrandingModal}
								/>
							</div>
						)}
					</div>

					{/* Social buttons - show on design page */}
					{pathname === "/design" && (
						<div className="flex flex-row gap-2 pointer-events-auto z-50">
							{/* Telegram button */}
							<div className="motion-translate-y-in-20 motion-blur-in-md motion-opacity-in-0 motion-delay-[150ms]">
								<Button
									href={TELEGRAM_CHANNEL_URL}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Visit Telegram"
									variant="outline"
									className="relative flex items-center justify-center w-[2.6rem] h-[2.6rem] md:w-[3.2rem] md:h-[3.2rem] rounded-full border border-black bg-background text-foreground hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground transition-all duration-500 p-0 [&_svg]:!w-[1.325rem] [&_svg]:!h-[1.325rem] md:[&_svg]:!w-[1.6rem] md:[&_svg]:!h-[1.6rem]"
									cursorType="link"
								>
									<TelegramIcon className="w-[1.125rem] h-[1.125rem] md:w-[1.375rem] md:h-[1.375rem]" />
								</Button>
							</div>
							{/* Instagram button */}
							<div className="motion-translate-y-in-20 motion-blur-in-md motion-opacity-in-0 motion-delay-[200ms]">
								<Button
									href={INSTAGRAM_URL}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Visit Instagram"
									variant="outline"
									className="relative flex items-center justify-center w-[2.6rem] h-[2.6rem] md:w-[3.2rem] md:h-[3.2rem] rounded-full border border-black bg-background text-foreground hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground transition-all duration-500 p-0 [&_svg]:!w-[1.325rem] [&_svg]:!h-[1.325rem] md:[&_svg]:!w-[1.6rem] md:[&_svg]:!h-[1.6rem]"
									cursorType="link"
								>
									<InstagramIcon className="w-[1.125rem] h-[1.125rem] md:w-[1.375rem] md:h-[1.375rem]" />
								</Button>
							</div>
						</div>
					)}
				</>
			) : null}
		</nav>
	);
}
