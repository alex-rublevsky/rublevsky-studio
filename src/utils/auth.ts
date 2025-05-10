// import { betterAuth } from "better-auth"
// import { reactStartCookies } from "better-auth/react-start";
// import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import db from "../db";
// //import { schema } from "../schema";
 
// export const auth = betterAuth({
//     database: drizzleAdapter(db, {provider: "sqlite", 
//         //schema: schema
//     }),
//     socialProviders: {
//         github: { 
//             clientId: process.env.GITHUB_CLIENT_ID as string, 
//             clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
//         }, 
//     },
//     plugins: [reactStartCookies()]
//     }
// )