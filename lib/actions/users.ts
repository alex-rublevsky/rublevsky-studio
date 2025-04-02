"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const signOut = async () => {
    await auth.api.signOut({
    headers: {}, // Minimal headers since we're in a server action
  });

  redirect("/sign-in");
};
