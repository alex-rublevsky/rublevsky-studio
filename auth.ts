import {DrizzleAdapter} from '@auth/drizzle-adapter'
import {compareSync} from 'bcrypt-ts-edge'
import NextAuth, { NextAuthConfig } from "next-auth"
import {users} from './server/schema'
import db from './server/db'
import CredentialsProvider from 'next-auth/providers/credentials'
import { eq } from 'drizzle-orm'

// Check if we're in a real database environment
const isRealDb = typeof process.env.DB !== 'undefined';

export const config = {
    pages:{
        signIn:"/sign-in",
        error: "/sign-in",
    },
    session:{
        strategy:"jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    // Only use the adapter when we have a real DB
    ...(isRealDb ? { adapter: DrizzleAdapter(db as any) } : {}),
    providers:[
        CredentialsProvider({
            credentials:{
                email:{type:"email"},
                password:{type:"password"},
            },
            async authorize(credentials){
                if (credentials == null) return null;
                
                // For development without a real DB, allow a test account
                if (!isRealDb) {
                    if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
                        return {
                            id: '1',
                            name: 'Admin User',
                            email: 'admin@example.com',
                            role: 'admin',
                        };
                    }
                    return null;
                }
                
                try {
                    const userResults = await db.select().from(users).where(eq(users.email, credentials.email as string));
                    
                    // Check if we have a user and get the first one (email should be unique)
                    if (userResults && userResults.length > 0) {
                        const user = userResults[0];
                        
                        if (user.password) {
                            const isMatch = compareSync(credentials.password as string, user.password);
                            if (isMatch){
                                return{
                                    id: user.id,
                                    name: user.name,
                                    email: user.email,
                                    role: user.role,
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Authentication error:', error);
                }
                return null;
            }
        })
    ],
    callbacks:{
        session: async ({session, user, trigger, token}: any) => {
            session.user.id = token.subs
            if (trigger === 'update') {
                session.user.name = user.name
            }
            return session
           
        },
    },
    // Add trusted hosts configuration for local development
    trustHost: true,
} satisfies NextAuthConfig
export const {handlers, auth, signIn, signOut} = NextAuth(config)








