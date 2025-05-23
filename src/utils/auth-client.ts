import {createAuthClient} from "better-auth/react";

const baseURL = "https://tanstack.rublevsky.studio"
//const baseURL = "http://localhost:3000";

export const {useSession, signIn, signOut, signUp, getSession} = createAuthClient({
  baseURL: baseURL,
  redirectTo: "/dashboard",
});
