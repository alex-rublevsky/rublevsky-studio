/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouter,
} from "@tanstack/react-router";
//import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import appCss from "../styles/app.css?url";
import { seo } from "~/utils/seo";
import { NavBar } from "~/components/ui/shared/NavBar";
import { PostHogWrapper } from "~/components/PostHogWrapper";
import { CursorContextProvider } from "~/components/ui/shared/custom_cursor/CustomCursorContext";
import CustomCursor from "~/components/ui/shared/custom_cursor/CustomCursor";
import { useIsMobile } from "~/hooks/use-mobile";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "Rublevsky Studio",
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "96x96",
        href: "/favicon-96x96.png",
      },
      // {
      //   rel: "icon",
      //   type: "image/png",
      //   sizes: "16x16",
      //   href: "/favicon-16x16.png",
      // },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
  context: () => ({
    queryClient,
  }),
});

function RootComponent() {
  const isMobile = useIsMobile();

  return (
    <PostHogWrapper>
      <QueryClientProvider client={queryClient}>
        <CursorContextProvider>
          {!isMobile && <CustomCursor />}
          <RootDocument>
            <Outlet />
          </RootDocument>
        </CursorContextProvider>
      </QueryClientProvider>
    </PostHogWrapper>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = router.state.location.pathname;

  return (
    <html lang="en" className={`${pathname === "/" ? "scroll-smooth" : ""}`}>
      <head>
        <HeadContent />
      </head>
      <body className="overscroll-none ">
        <NavBar />
        {children}
        {/* <TanStackRouterDevtools position="bottom-right" /> */}
        <Scripts />
      </body>
    </html>
  );
}
