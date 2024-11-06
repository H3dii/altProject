import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, ShouldRevalidateFunction, useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Icon from "~/components/Icons";
import LazyImage from "~/components/LazyImages";
import { GetRequest, IsError } from "~/utils/api";
import { formatTitleToSlug } from "~/utils/function";
import { getSession } from "~/utils/session.server";
type useLoaderType = {
    anime: any | null;
    pagination: any | null;
    error: any | null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const session = await getSession(request.headers.get("Cookie"));
    const error = url.searchParams.get("error");
    if (session.has("auth")) {
        try {
            const { data: anime } = await GetRequest(`/anime?page=${url.searchParams.get("page") || 1}`, session.get("auth"));
            return json({ anime: anime.data, pagination: anime.pagination, error: error || null });
        } catch (error) {
            const err = await IsError(error);
            console.log(err);

            return json({ anime: null, pagination: null, error: error || null });
        }
    } else {
        return redirect("/");
    }
};

function DashboardAnimeIndex() {
    const { anime, pagination, error } = useLoaderData<useLoaderType>();
    const animes = anime;

    return (
        <div className="flex flex-col gap-4 p-4 w-full">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold w-[11rem]">Anime</h1>
                <div className="flex justify-center flex-col items-center gap-4 w-full">
                    <h1 className="text-2xl font-medium">Kereső</h1>
                    <div className="flex items-center w-full justify-center">
                        <input type="text" name="search" id="search" placeholder="Keresés..." className="max-w-[28rem] w-full px-4 py-2 rounded-l-md bg-neutral-800 text-white" />
                        <button aria-label="Keresés" className="w-max px-4 py-2 rounded-r-md bg-neutral-800 text-white border-l border-neutral-700">
                            Keresés
                        </button>
                    </div>
                </div>
                <Link to={"/dashboard/anime/create"} aria-label="Anime létrehozás" className="text-lg whitespace-nowrap w-[11rem] font-bold px-4 py-2 bg-sky-600 hover:bg-sky-700 duration-200 rounded-md">
                    Anime létrehozás
                </Link>
            </div>

            <div className="w-full flex items-center flex-wrap">
                <div className="flex items-start justify-center w-full h-full gap-8 p-4 flex-wrap ">
                    {animes ? (
                        animes.map((anime: any) => (
                            <Link key={anime.id} aria-label={anime.title} to={`/dashboard/anime/${anime.id}/${formatTitleToSlug(anime.title)}`} className="group relative flex flex-col bg-neutral-900 border-2 hover:border-sky-500/60 duration-200 cursor-pointer border-neutral-800 shadow-md drop-shadow-md rounded-md overflow-hidden max-w-[255px] min-w-[255px]">
                                <div className="flex justify-between items-start gap-2 absolute top-2 w-full  px-2">
                                    <div className="flex justify-start items-start flex-col gap-2">
                                        <div className={`${anime.published ? "bg-sky-600" : "bg-gray-800"} rounded-md px-4 py-1 text-[0.8rem] shadow-md drop-shadow-md font-medium flex items-center justify-center z-40`}>{anime.published ? "Publikálva" : "Nincs publikálva"}</div>
                                    </div>
                                </div>
                                <div className="flex flex-col h-[319px] overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-30 group-hover:opacity-100 duration-200 opacity-0 flex items-center justify-center">
                                        <div className="w-[3.5rem] h-[3.5rem] rounded-full bg-sky-600/50 flex items-center justify-center">
                                            <Icon name="FaEdit" className="text-2xl " />
                                        </div>
                                    </div>
                                    <LazyImage src={`${anime.cover}`} alt={anime.title} className="w-full h-full object-cover object-center group-hover:scale-110 duration-200" />
                                </div>
                                <div className="border-t-2 border-neutral-700 p-2 px-4 flex flex-col gap-2 relative group">
                                    <h1 className="text-center absolute group-hover:bottom-[2.6rem] bottom-[2rem] left-0 bg-neutral-900/80 w-full group-hover:opacity-100 duration-200 opacity-0 z-40">{anime.title}</h1>
                                    <h1 className="text-center overflow-hidden whitespace-nowrap text-ellipsis">{anime.title}</h1>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <h1 className="text-2xl font-bold">Nincs még anime</h1>
                    )}
                </div>
            </div>
            {pagination && pagination.totalPages > 1 && (
                <div className="w-full flex items-center justify-center">
                    <ul className="bg-neutral-800 rounded-md max-w-[28rem] w-max gap-1 p-1 flex items-center">
                        {Array.from({ length: pagination.totalPages }).map((_, i) => (
                            <Link key={i + 1} to={`/dashboard/anime?page=${i + 1}`} className={`${Number(pagination.currentPage) === i + 1 ? "text-sky-500 bg-neutral-700/60" : "hover:bg-neutral-700/60"} px-4 py-2 w-max rounded-md duration-200 font-medium text-lg`}>
                                {i + 1}
                            </Link>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default DashboardAnimeIndex;
