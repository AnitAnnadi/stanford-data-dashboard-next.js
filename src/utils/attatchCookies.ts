import {SignJWT} from "jose"
import {cookies} from "next/headers"

export const createJWT = async (payload: any, lifetime: string) => {
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT(payload).setProtectedHeader({alg: "HS256"}).setIssuedAt().setExpirationTime(lifetime).sign(secretKey);

    return token;
}

export const attachCookie = async (name: string, token: string, exp: number ) => {
    const cookieStore = await cookies();

    cookieStore.set({
        name,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(Date.now() + exp)
    })
}