import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "@/server/db"; // your drizzle instance
import { schema } from "@/server/schema";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    // emailAndPassword: {  
    //     enabled: true
    // },
    socialProviders: {
        google: {
            enabled: true,
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            // Add allowDangerousEmailAccountLinking to bypass some security
            allowDangerousEmailAccountLinking: true
        }
    },
    database: drizzleAdapter(db, {
        provider: "sqlite",
        schema: schema
    }),

    plugins: [nextCookies()],
    trustedOrigins: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://rublevsky-studio.alexander-rublevskii.workers.dev",
        "https://rublevsky.studio",
        "https://www.rublevsky.studio"
    ], 
    debug: true,
    disableCSRFCheck: true,
    allowInsecureOrigins: true,
});