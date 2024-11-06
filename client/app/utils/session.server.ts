import { createCookieSessionStorage } from "@remix-run/node";
import config from "./config";

export let sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "__session",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        secrets: [config.SESSION_SECRETS],
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    },
});

export async function getSession(cookieHeader: string | null) {
    return sessionStorage.getSession(cookieHeader);
}

export async function commitSession(session: any) {
    return sessionStorage.commitSession(session);
}

export async function destroySession(session: any) {
    return sessionStorage.destroySession(session);
}
