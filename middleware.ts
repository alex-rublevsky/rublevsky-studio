import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
 
type Session = typeof auth.$Infer.Session;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const adminRoutes = ["/admin", "/admin/products", "/admin/categories", "/admin/brands", "/admin/blog", "/admin/orders", "/admin/customers"];
const authRoutes = ["/sign-in"]; 

export async function middleware(request: NextRequest) {
    const pathName = request.nextUrl.pathname;
    
    // Check if the path is an admin route or auth route
    const isAdminRoute = adminRoutes.some(route => pathName.startsWith(route));
    const isAuthRoute = authRoutes.includes(pathName);
    
    // Skip middleware for non-admin and non-auth routes
    if (!isAdminRoute && !isAuthRoute) {
        return NextResponse.next();
    }


	const { data: session } = await betterFetch<Session>(
        "/api/auth/get-session", 
        {
            baseURL: request.nextUrl.origin,
            headers: {
                cookie: request.headers.get("cookie") || "", // Forward cookies
            },
        }
    );
   
    // Protect admin routes - redirect to sign-in if not authenticated
    if (!session && isAdminRoute) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }
 
    // Redirect admin users from sign-in page to admin panel
    if (session?.user?.email === ADMIN_EMAIL && isAuthRoute) {
        return NextResponse.redirect(new URL("/admin", request.url));
    }
    
    // Prevent non-admin users from accessing admin routes
    if (session && session.user?.email !== ADMIN_EMAIL && isAdminRoute) {
        // Add auth_error parameter to show the unauthorized error message
        return NextResponse.redirect(new URL("/sign-in?auth_error=unauthorized", request.url));
    }

    return NextResponse.next();
}
 
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], // Apply middleware to specific routes
};