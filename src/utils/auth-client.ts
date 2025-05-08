import {createAuthClient} from "better-auth/react";

const baseURL = process.env.NODE_ENV === 'production' 
  ? "https://tanstack.rublevsky.studio"
  : "http://localhost:3000";

export const {useSession, signIn, signOut, signUp, getSession} = createAuthClient({
  baseURL: "https://tanstack.rublevsky.studio",
  redirectTo: "/dashboard",
});
