import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "~/utils/auth-middleware";

type AuthContext = {
    user: {
        id: string | undefined;
        name: string | undefined;
        email: string | undefined;
        image: string | undefined;
    };
};

export const getUserID = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }: { context: AuthContext }) => {
    return context?.user?.id;
  });

export const getUserEmail = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }: { context: AuthContext }) => {
    return context?.user?.email;
  });

export const getAvatar = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }: { context: AuthContext }) => {
    return context?.user?.image;
  });

