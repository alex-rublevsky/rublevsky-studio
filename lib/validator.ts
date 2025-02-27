import * as z from "zod";

//USER
export const signInFormSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
})
    