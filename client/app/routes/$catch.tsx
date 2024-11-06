import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Link, useNavigate } from "@remix-run/react";
import config from "~/utils/config";
import { setMeta } from "~/utils/function";
export const meta: MetaFunction = ({ matches }) => {
    const metaTags = [{ title: `${config.SITENAME} - Page not found` }];
    return setMeta(matches, metaTags);
};
export let loader: LoaderFunction = async () => {
    return json({ message: "Page not found" }, { status: 404 });
};

export default function CatchAll() {
    const navigate = useNavigate();
    return (
        <div className="bg-neutral-900 z-[50] fixed top-0 left-0 w-full h-full text-white flex items-center justify-center">
            <div className="text-center p-14 bg-neutral-800 rounded-md ">
                <h1 className="text-6xl font-bold mb-4">404</h1>
                <p className="text-2xl mb-4">Hoppá! Úgy tűnik, eltévedtél...</p>
                <p className="text-lg mb-8">Ez az oldal nem található. Lehet, hogy rossz linket követtél, vagy az oldal már nem létezik.</p>
                <Link to="/" className="bg-sky-600 hover:bg-sky-700 duration-200 text-white text-lg font-medium px-6 py-3 rounded-full transition">
                    Vissza a főoldalra
                </Link>
            </div>
        </div>
    );
}
