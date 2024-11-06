import { json, Link, Links, Meta, MetaFunction, Outlet, Scripts, ScrollRestoration, ShouldRevalidateFunction, useLoaderData, useNavigate, useNavigation, useRouteError, useRouteLoaderData } from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useEffect, useState } from "react";
import "./tailwind.css";
import config from "./utils/config";
import { setMeta } from "./utils/function";
import { commitSession, getSession } from "./utils/session.server";
import { ToastContainer } from "react-toastify";
import { GetRequest, IsError } from "./utils/api";
import { UserData } from "./utils/types";
import Navbar from "./components/Navbar";
import "react-toastify/dist/ReactToastify.css";
export const links: LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" },
];
export const meta: MetaFunction = ({ matches }) => {
    const metaTags = [
        { title: `${config.SITENAME} - Ahol az anime kezdődik` },
        {
            name: "description",
            content: `Fedezd fel az ${config.SITENAME}, ahol a legjobb minőségű anime feliratokkal és streaming lehetőségekkel várunk! Nézd kedvenc sorozataidat magyarul, ingyen és bármikor. Az oldalunkon megtalálod a legújabb és legnépszerűbb anime sorozatokat magyar felirattal.`,
        },
        {
            name: "keywords",
            content: `anime, magyar anime, anime streaming, anime felirat, ingyenes anime, ${config.SITENAME}, anime online, magyar feliratal, anime magyarul, anime sorozatok, anime filmek, feliratos anime, új anime, népszerű anime`,
        },
        { name: "author", content: `${config.SITENAME} Team` },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: `${config.SITENAME} - Ahol az anime kezdődik` },
        {
            property: "og:description",
            content: `Nézd a legjobb anime sorozatokat magyar felirattal az ${config.SITENAME}! Folyamatos frissítések, új megjelenések és a legújabb anime hírek várnak rád.`,
        },
        { property: "og:image", content: "https://otamoon.hu/logo.png" }, // Add meg a megfelelő képet
        { property: "og:url", content: "https://otamoon.hu" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${config.SITENAME} - Ahol az anime kezdődik` },
        {
            name: "twitter:description",
            content: `Fedezd fel az ${config.SITENAME}, ahol a legjobb anime sorozatok várnak magyar felirattal! Csatlakozz hozzánk, és élvezd az anime világát.`,
        },
        { name: "twitter:image", content: "https://otamoon.hu/logo.png" }, // Add meg a megfelelő képet
    ];
    return setMeta(matches, metaTags);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const session = await getSession(request.headers.get("Cookie"));
    if (session.has("auth")) {
        try {
            const { data: user } = await GetRequest("/auth/me", session.get("auth"));
            console.log(user);
            return json({ user: user });
        } catch (error) {
            const err = IsError(error);
            console.log(err);
            session.unset("auth");
            return json({ user: null }, { headers: { "Set-Cookie": await commitSession(session) } });
        }
    }
    return json({ user: null }, { headers: { "Set-Cookie": await commitSession(session) } });
};

export default function App() {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);
    const { user } = useLoaderData<{ user: UserData | null }>();
    return (
        <Layout>
            <Navbar user={user} />
            <Outlet />
            {isClient && <ToastContainer position="bottom-left" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />}
        </Layout>
    );
}

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <html lang={"hu"} dir="ltr">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes" />
                <Meta />
                <Links />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" key="font" />
            </head>
            <body id="root">
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
};

export function ErrorBoundary() {
    //TODO: Relase Versions remove comment and {error.message} -> redirect...
    const error = useRouteError();
    /*useEffect(() => {
        window.location.href = "/";
    }, []);
    */
    console.log(error);
    return <Layout>{error.message}</Layout>;
}

export const shouldRevalidate: ShouldRevalidateFunction = ({ actionResult, defaultShouldRevalidate }) => {
    if (actionResult) {
        if (actionResult.error || actionResult.success || actionResult.errors) {
            return false;
        }
    }
    return defaultShouldRevalidate;
};
