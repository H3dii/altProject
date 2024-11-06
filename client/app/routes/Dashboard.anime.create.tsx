import { ActionFunctionArgs, json } from "@remix-run/node";
import { Link, useFetcher, useNavigate } from "@remix-run/react";
import { AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Spinner from "~/components/Spinner";
import { IsError, PostRequest } from "~/utils/api";
import { sleep } from "~/utils/function";
import { commitSession, getSession } from "~/utils/session.server";
import { validate } from "~/utils/validate";

const customMessages = {
    mal: "Ez nem egy valid MyAnimeList URL.",
    required: "Ez nem lehet üres.",
};
type MalFetcherData = {
    errors?: { [key: string]: string };
    error?: string;
    success?: boolean;
    animeid: number;
    login?: boolean;
    user?: {
        id: number;
        username: string;
        global_name: string | null;
        email: string;
        avatar: any;
    };
};
function DashboardAnimeCreate() {
    const MalFetcher = useFetcher<MalFetcherData>();
    const [running, setRunning] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const navigate = useNavigate();
    const handleValidation = (e: React.ChangeEvent<HTMLInputElement>, settings: any) => {
        const error = validate(e.target.value, settings, customMessages);
        setErrors((prevErrors) => ({
            ...prevErrors,
            [e.target.name]: error || "",
        }));
        if (!error) {
            setServerError(null);
        }
    };
    useEffect(() => {
        if (MalFetcher.state === "submitting") {
            setRunning(true);
        }
    }, [MalFetcher]);
    useEffect(() => {
        if (MalFetcher.data) {
            if (!MalFetcher.data.success) {
                if (MalFetcher.data.error) {
                    switch (MalFetcher.data.error) {
                        case "Unauthorized":
                            window.location.href = "/";
                            break;
                        case "permissons denied":
                            window.location.href = "/";
                            break;
                        default:
                            setServerError(MalFetcher.data.error || null);
                            break;
                    }
                }
                setErrors(MalFetcher.data.errors || {});
                setRunning(false);
                return;
            }
            setServerError(null);
            setErrors({});
            setRunning(false);
            navigate(`/dashboard/anime/${MalFetcher.data.animeid}`);
            toast.success("Sikeres létrehozás!");
        }
    }, [MalFetcher.data]);

    return (
        <>
            <AnimatePresence>{running && <Spinner fixed={true} />}</AnimatePresence>
            <div className="flex flex-col w-full h-full justify-start items-start p-4 gap-4">
                <div className="flex items-center justify-between w-full">
                    <h1 className="text-2xl font-bold">Anime Létrehozás</h1>
                    <Link to="/dashboard/anime" aria-label="Vissza" className="text-lg font-medium bg-rose-700 hover:bg-red-800 duration-200 rounded-md px-4 py-2">
                        Vissza
                    </Link>
                </div>
                <div className="flex w-full h-full items-start justify-center">
                    <MalFetcher.Form method="post" action="/dashboard/anime/create" className="bg-neutral-800/60 shadow-md drop-shadow-md max-w-[38rem] w-full p-4 rounded-md gap-4 flex flex-col">
                        <label className="flex flex-col gap-1">
                            <p className="text-md font-medium">MyAnimeList Url</p>
                            <input onChange={(e) => handleValidation(e, { required: true, mal: true })} type="text" name="mal" id="mal" placeholder="https://myanimelist.net/anime/..." className={`${errors.mal ? "border-rose-500" : "border-transparent"} border w-full p-2 rounded-md bg-neutral-700/60 font-medium text-lg`} />
                            {errors.mal && <span className="text-rose-500">{errors.mal}</span>}
                        </label>
                        <span className="text-rose-500">{!running && serverError}</span>
                        <button aria-label="Tovább" className={`${running ? "bg-sky-800" : "bg-sky-600 hover:bg-sky-700"} w-full px-4 py-2  duration-200 rounded-md font-medium text-lg`}>
                            {running ? <Spinner size="2rem" /> : "Tovább"}
                        </button>
                    </MalFetcher.Form>
                </div>
            </div>
        </>
    );
}

export default DashboardAnimeCreate;

export const action = async ({ request, params }: ActionFunctionArgs) => {
    await sleep(500);
    const data = await request.formData();
    const { mal } = Object.fromEntries(data) as Record<string, string>;
    const malSettings = { required: true, mal: true };

    const errors: Record<string, string | undefined> = {
        mal: validate(mal, malSettings, customMessages),
    };

    if (errors.mal) {
        return { errors };
    }

    const session = await getSession(request.headers.get("Cookie"));
    if (session.has("auth")) {
        try {
            const postdata = {
                mal: mal,
            };
            const { data: data } = await PostRequest("/anime/create", postdata, session.get("auth"));
            console.log(data);
            return { success: true, animeid: data };
        } catch (error) {
            const err = await IsError(error);
            console.log(err);
            switch (err) {
                case "Unauthorized":
                    session.unset("auth");
                    return json({ error: "Unauthorized" }, { headers: { "Set-Cookie": await commitSession(session) } });
                case "Tihs anime is taken":
                    return { error: "Ez az anime már létezik" };
                case "Invalid client id": {
                    return { error: "Api Hiba jelezd a fejlesztők felé" };
                }
                default:
                    return { error: "Ismeretlen Hiba" };
            }
        }
    } else {
        session.unset("auth");
        return json({ error: "permissons denied" }, { headers: { "Set-Cookie": await commitSession(session) } });
    }
};
