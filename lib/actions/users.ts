"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";


export const signOut = async () => {
    const headersList = headers();
    await auth.api.signOut({
        headers: headersList
    });
    
    redirect("/sign-in");
}