import {createMiddleware} from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import {auth} from "~/utils/auth";

type AuthUser = {
    id: string | undefined;
    name: string | undefined;
    email: string | undefined;
    image: string | undefined;
};

export const authMiddleware = createMiddleware().server(async ({next}) => {
    try {
        // Get the web request to access headers for better-auth
        const request = getWebRequest();
        
        // Get the session using better-auth with headers
        // Fall back to empty headers if request is not available
        const session = await auth.api.getSession({
            headers: request?.headers || new Headers()
        });
        
        console.log('Auth middleware - session:', session);
        
        const user: AuthUser = {
            id: session?.user?.id || undefined,
            name: session?.user?.name || undefined,
            email: session?.user?.email || undefined,
            image: session?.user?.image || undefined,
        };
        
        return await next({
            context: {
                user
            },
        });
    } catch (error) {
        console.error('Auth middleware error:', error);
        const user: AuthUser = {
            id: undefined,
            name: undefined,
            email: undefined,
            image: undefined,
        };
        
        return await next({
            context: {
                user
            },
        });
    }
}
);