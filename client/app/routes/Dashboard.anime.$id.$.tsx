import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, ShouldRevalidateFunction, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import LazyImage from "~/components/LazyImages";
import { ModalComponent } from "~/components/Modal";
import SelectMulti from "~/components/SelectMulti";
import SelectOne from "~/components/SelectOne";
import Spinner from "~/components/Spinner";
import { GetRequest, IsError, PostRequest } from "~/utils/api";
import { sleep } from "~/utils/function";
import { commitSession, getSession } from "~/utils/session.server";
import { animeType, genreType, media_type, modalType, publishes, seassonType, SelectType, statuses } from "~/utils/types";
type useLoaderType = {
    anime: animeType;
    genre: genreType[] | null;
    studio: genreType[] | null;
    season: seassonType[] | null;
    error: string | null;
};

type animeDeleteFetcherData = {
    error?: string;
    success?: boolean;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const session = await getSession(request.headers.get("Cookie"));
    if (session.has("auth")) {
        const animeid = params.id;
        if (animeid) {
            try {
                const { data: anime } = await GetRequest(`/anime/${animeid}`, session.get("auth"));
                const { data: genre } = await GetRequest(`/genre`);
                const { data: studio } = await GetRequest(`/studio`);
                const { data: season } = await GetRequest(`/season`);
                console.log(anime);
                return json({ anime: anime, genre: genre, studio: studio, season: season, error: null });
            } catch (error) {
                const err = await IsError(error);
                console.log(err);
                return json({ anime: null, genre: null, studio: null, season: null, error: "DataLoadError" });
            }
        } else {
            return json({ anime: null, genre: null, studio: null, season: null, error: "NotFound" });
        }
    }
    session.unset("auth");
    return redirect("/login", { headers: { "Set-Cookie": await commitSession(session) } });
};
function DashboardAnimeId() {
    const animeDeleteModalRef = useRef<modalType | null>(null);
    const animeDeleteFetcher = useFetcher<animeDeleteFetcherData>();
    const animeSaveFetcher = useFetcher<animeDeleteFetcherData>();
    const { anime, genre, studio, season, error } = useLoaderData<useLoaderType>();
    const navigate = useNavigate();
    useEffect(() => {
        if (error) {
            switch (error) {
                case "DataLoadError":
                    navigate("/dashboard/anime");
                    toast.error("Hiba lépet fell az adatok betöltése közben.");
                    break;
                case "NotFound":
                    navigate("/dashboard/anime");
                    toast.error("Nem található az anime.");
                    break;
            }
        }
    }, [error]);

    if (anime) {
        const [running, setRunning] = useState<boolean>(false);
        //?STATUS
        const [activeStatus, setActiveStatus] = useState<SelectType | null>(anime.status_type ? statuses.find((d) => d.value === anime.status_type) || null : null);
        //?MEDIA_TYPE
        const [mediaTypeStatus, setMediaTypeStatus] = useState<SelectType | null>(anime.media_type ? media_type.find((d) => d.value === anime.media_type) || null : null);
        //?PUBLISH
        const [activePublish, setActivePublish] = useState<SelectType | null>(anime.published ? publishes[0] : publishes[1]);
        //?GENDES
        const genres = genre ? genre.map((d) => ({ value: d.id, label: d.name } as SelectType)) : [];
        const animeGenreIds = anime.genres ? anime.genres.map((g: any) => g.id) : [];
        const [activeGenres, setActiveGenres] = useState<SelectType[]>(Array.isArray(animeGenreIds) && animeGenreIds.length > 0 ? genres.filter((d) => animeGenreIds.includes(d.value)) : []);
        //? STUDIOS
        const studios = studio ? studio.map((d) => ({ value: d.id, label: d.name } as SelectType)) : [];
        const animeStudiosIds = anime.studios ? anime.studios.map((g: any) => g.id) : [];
        const [activeStudios, setActiveStudios] = useState<SelectType[]>(Array.isArray(animeStudiosIds) && animeStudiosIds.length > 0 ? studios.filter((d) => animeStudiosIds.includes(d.value)) : []);
        //? SEASSON
        const seasons = season ? season.map((d) => ({ value: d.id, label: `${d.year} ${d.season} ` } as SelectType)) : [];
        const animeseasonId = anime.season ? anime.season.id : null; // Használj null-t, ha nincs szezon
        const [seasonStatus, setSeasonStatus] = useState<SelectType | null>(animeseasonId ? seasons.find((d) => d.value === animeseasonId) || null : null);

        //?DELETE
        const animeDelete = (anime: animeType) => {
            if (animeDeleteModalRef.current) {
                animeDeleteModalRef.current.open();
            }
        };
        const deleteStart = (anime: animeType) => {
            const formdata = new FormData();
            formdata.append("type", "delete");
            formdata.append("id", anime.id.toString());
            animeDeleteFetcher.submit(formdata, { method: "post", action: `/dashboard/anime/${anime.id}` });
        };
        useEffect(() => {
            if (animeDeleteFetcher.data) {
                if (!animeDeleteFetcher.data.success) {
                    if (animeDeleteFetcher.data.error) {
                        setRunning(false);
                        switch (animeDeleteFetcher.data.error) {
                            case "Unauthorized":
                                navigate("/");
                                break;
                            default:
                                navigate("/dashboard/anime");
                                toast.error(animeDeleteFetcher.data.error);
                                break;
                        }
                    }
                    return;
                }
                navigate(`/dashboard/anime`);
                toast.success("Sikeres Törölve!");
            }
        }, [animeDeleteFetcher.data]);
        useEffect(() => {
            if (animeDeleteFetcher.state === "submitting") {
                setRunning(true);
            }
        }, [animeDeleteFetcher]);
        //TODO: további adaok hozzáadása pl
        //? Start date end date episódok stb.... db ben van minden ami kelhet sessions sutidos stb...
        const titleRef = useRef<HTMLInputElement>(null);
        const synonymsRef = useRef<HTMLInputElement>(null);
        const entitleRef = useRef<HTMLInputElement>(null);
        const jatitleRef = useRef<HTMLInputElement>(null);
        const descriptionRef = useRef<HTMLTextAreaElement>(null);
        const num_episodesRef = useRef<HTMLInputElement>(null);
        const average_episode_durationRef = useRef<HTMLInputElement>(null);
        const start_dateRef = useRef<HTMLInputElement>(null);
        const end_dateRef = useRef<HTMLInputElement>(null);
        const saveAnime = (anime: animeType) => {
            const formdata = new FormData();
            formdata.append("type", "save");
            formdata.append("id", anime.id.toString());
            formdata.append("title", titleRef.current?.value || anime.title);
            formdata.append("alternative_titles.synonyms", synonymsRef.current?.value || anime.alternative_titles?.synonyms?.[0] || "");
            formdata.append("alternative_titles.en", entitleRef.current?.value || anime.alternative_titles?.en || "");
            formdata.append("alternative_titles.ja", jatitleRef.current?.value || anime.alternative_titles?.ja || "");
            formdata.append("published", activePublish?.value ? "1" : "0");
            formdata.append("status_type", (activeStatus?.value as string | null) || anime.status_type);
            formdata.append("media_type", (mediaTypeStatus?.value as string | null) || anime.media_type);
            formdata.append("num_episodes", num_episodesRef.current?.value || anime.num_episodes.toString());
            formdata.append("average_episode_duration", average_episode_durationRef.current?.value || anime.average_episode_duration.toString());
            formdata.append("start_date", start_dateRef.current?.value || anime.start_date);
            formdata.append("end_date", end_dateRef.current?.value || anime.end_date);
            formdata.append("season", (seasonStatus?.value as string | null) || anime.season.id.toString());

            formdata.append("description", descriptionRef.current?.value || anime.description);
            const genres = activeGenres || anime.genres || [];
            genres.forEach((genre: any) => {
                formdata.append("genres[]", genre.value || genre.id); // használj "genres[]" a tömb elemekhez
            });
            const studios = activeStudios || anime.studios || [];
            studios.forEach((studio: any) => {
                formdata.append("studios[]", studio.value || studio.id); // használj "genres[]" a tömb elemekhez
            });
            animeSaveFetcher.submit(formdata, { method: "post", action: `/dashboard/anime/${anime.id}` });
        };
        useEffect(() => {
            if (animeSaveFetcher.data) {
                if (!animeSaveFetcher.data.success) {
                    if (animeSaveFetcher.data.error) {
                        setRunning(false);
                        switch (animeSaveFetcher.data.error) {
                            case "Unauthorized":
                                navigate("/");
                                break;
                            default:
                                navigate("/dashboard/anime");
                                toast.error(animeSaveFetcher.data.error);
                                break;
                        }
                    }
                    return;
                }
                navigate(`/dashboard/anime`);
                toast.success("Sikeres mentve!");
            }
        }, [animeSaveFetcher.data]);
        useEffect(() => {
            if (animeSaveFetcher.state === "submitting") {
                setRunning(true);
            }
        }, [animeSaveFetcher]);
        return (
            <>
                <AnimatePresence>{running && <Spinner fixed={true} />}</AnimatePresence>

                <div className="flex flex-col gap-10 p-4 w-full">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold w-full">Anime: {anime.title}</h1>
                        <div className="flex items-center gap-4">
                            <button onClick={() => saveAnime(anime)} aria-label="Adatok mentése" className="text-lg whitespace-nowrap w-max font-bold px-4 py-2 bg-sky-600 hover:bg-sky-700 duration-200 rounded-md">
                                Mentés
                            </button>
                            <button onClick={() => animeDelete(anime)} aria-label="Anime törlés" className="text-lg whitespace-nowrap w-max font-bold px-4 py-2 bg-rose-600 hover:bg-rose-700 duration-200 rounded-md">
                                Törlés
                            </button>
                            <Link to={"/dashboard/anime"} aria-label="Anime létrehozás" className="text-lg whitespace-nowrap w-max font-bold px-4 py-2 bg-rose-600 hover:bg-rose-700 duration-200 rounded-md">
                                Vissza
                            </Link>
                        </div>
                    </div>
                    <div className="flex flex-col w-full gap-6">
                        <div className="flex xl:flex-row flex-col gap-4 w-full items-start">
                            <div className="overflow-hidden min-w-[18rem] max-w-[18rem] w-full aspect-[3/4]  bg-neutral-800 rounded-md">
                                <LazyImage src={anime.cover} alt={anime.title} className="w-full object-cover object-center" />
                            </div>
                            <div className="flex flex-col gap-4 w-full">
                                <div className="flex flex-row flex-wrap  gap-4 w-full">
                                    <label className="flex flex-col gap-1 max-w-[320px] w-full">
                                        <p className="text-md font-medium">Anime Cím</p>
                                        <input ref={titleRef} type="text" name="title" id="title" defaultValue={anime.title} className="w-full px-4 py-2 rounded-md bg-neutral-800 text-white" />
                                    </label>
                                    <label className="flex flex-col gap-1 max-w-[320px] w-full">
                                        <p className="text-md font-medium">Synonyms Cím</p>
                                        <input ref={synonymsRef} type="text" name="synonyms" id="synonyms" defaultValue={anime.alternative_titles?.synonyms && anime.alternative_titles.synonyms[0]} className="w-full px-4 py-2 rounded-md bg-neutral-800 text-white" />
                                    </label>
                                    <label className="flex flex-col gap-1 max-w-[320px] w-full">
                                        <p className="text-md font-medium">Angol Cím</p>
                                        <input ref={entitleRef} type="text" name="entitle" id="entitle" defaultValue={anime.alternative_titles?.en} className="w-full px-4 py-2 rounded-md bg-neutral-800 text-white" />
                                    </label>
                                    <label className="flex flex-col gap-1 max-w-[320px] w-full">
                                        <p className="text-md font-medium">Japán Cím</p>
                                        <input ref={jatitleRef} type="text" name="jatitle" id="jatitle" defaultValue={anime.alternative_titles?.ja} className="w-full px-4 py-2 rounded-md bg-neutral-800 text-white" />
                                    </label>
                                </div>
                                <div className="flex flex-row flex-wrap gap-4 w-full">
                                    <label className="flex flex-col gap-1 w-full max-w-[calc(1920px_-_16rem)]">
                                        <p className="text-md font-medium">Leírás</p>
                                        <textarea ref={descriptionRef} name="description" id="description" defaultValue={anime.description} className="w-full px-4 py-2 rounded-md resize-none h-[17rem] bg-neutral-800 text-white" />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex lg:flex-row flex-col flex-wrap w-full gap-4">
                            <div className="flex flex-col gap-1 max-w-[310px] w-full">
                                <p className="text-md font-medium">Anime Állapot</p>
                                <SelectOne selectedData={publishes} defaultData={activePublish} placeholder="Válassz anime àllapotot" onChange={(plublish) => setActivePublish(plublish)} />
                            </div>
                            <div className="flex flex-col gap-1 max-w-[310px] w-full">
                                <p className="text-md font-medium">Anime Státusz</p>
                                <SelectOne selectedData={statuses} defaultData={activeStatus} placeholder="Válassz anime státuszt" onChange={(status) => setActiveStatus(status)} />
                            </div>
                            <div className="flex flex-col gap-1 max-w-[310px] w-full">
                                <p className="text-md font-medium">Anime Kategória</p>
                                <SelectMulti placeholder="Válassz kategóriákat" selectedData={genres} defaultData={activeGenres} onChange={(genre: any) => setActiveGenres(genre)} />
                            </div>
                            <div className="flex flex-col gap-1 max-w-[310px] w-full">
                                <p className="text-md font-medium">Anime Tipusa</p>
                                <SelectOne placeholder="Válassz Tipust" selectedData={media_type} defaultData={mediaTypeStatus} onChange={(media_type: any) => setMediaTypeStatus(media_type)} />
                            </div>
                            <div className="flex flex-col gap-1 max-w-[310px] w-full">
                                <p className="text-md font-medium">Anime Season</p>
                                <SelectOne placeholder="Válassz Seasont" selectedData={seasons} defaultData={seasonStatus} onChange={(season: any) => setSeasonStatus(season)} />
                            </div>
                            <div className="flex flex-col gap-1 max-w-[310px] w-full">
                                <p className="text-md font-medium">Anime studiókat</p>
                                <SelectMulti placeholder="Válassz Studiót" selectedData={studios} defaultData={activeStudios} onChange={(studios: any) => setActiveStudios(studios)} />
                            </div>
                            <label className="flex flex-col gap-1 max-w-[310px] w-full">
                                <p className="text-md font-medium">Episódok</p>
                                <input ref={num_episodesRef} type="number" name="num_episodes" id="num_episodes" defaultValue={anime.num_episodes} className="w-full px-4 py-2 rounded-md  bg-neutral-800 text-white" />
                            </label>
                            <label className="flex flex-col gap-1 max-w-[310px] w-full">
                                <p className="text-md font-medium">Episódok Átlag hosszága (Másodperc)</p>
                                <input ref={average_episode_durationRef} type="number" name="average_episode_duration" id="average_episode_duration" defaultValue={anime.average_episode_duration} className="w-full px-4 py-2 rounded-md  bg-neutral-800 text-white" />
                            </label>
                            <label className="flex flex-col gap-1 max-w-[310px] w-full">
                                <p className="text-md font-medium">Kezdés</p>
                                <input ref={start_dateRef} type="date" name="start_date" id="start_date" defaultValue={anime.start_date} className="w-full px-4 py-2 rounded-md  bg-neutral-800 text-white" />
                            </label>
                            <label className="flex flex-col gap-1 max-w-[310px] w-full">
                                <p className="text-md font-medium">Vége</p>
                                <input ref={end_dateRef} type="date" name="end_date" id="end_date" defaultValue={anime.end_date} className="w-full px-4 py-2 rounded-md  bg-neutral-800 text-white" />
                            </label>
                        </div>
                    </div>
                </div>
                <ModalComponent ref={animeDeleteModalRef}>
                    <div className="flex items-center justify-center w-full flex-col gap-4">
                        <h1 className="text-center font-medium text-2xl">Biztos vagy benne?</h1>
                        <h2 className="text-center font-medium text-md">
                            Biztos törölni akkarod a(z) <span className="text-sky-500 font-bold">{anime.title}</span> anime-t
                        </h2>
                        <div className="flex w-full justify-between items-center gap-4">
                            <button onClick={() => deleteStart(anime)} className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-700 duration-200 rounded-md text-lg font-medium">
                                Törlés
                            </button>
                            <button onClick={() => animeDeleteModalRef.current?.close()} className="w-full px-4 py-2 bg-rose-600 hover:bg-rose-700 duration-200 rounded-md text-lg font-medium">
                                Mégse
                            </button>
                        </div>
                    </div>
                </ModalComponent>
            </>
        );
    } else {
        return (
            <div className="flex w-full h-full justify-center items-center">
                <Spinner />
            </div>
        );
    }
}

export default DashboardAnimeId;

export const action = async ({ request, params }: ActionFunctionArgs) => {
    await sleep(1000);
    const data = await request.formData();
    const type = data.get("type");
    if (type === "delete") {
        const id = data.get("id");
        const session = await getSession(request.headers.get("Cookie"));
        if (!session.has("auth")) {
            session.unset("auth");
            return json({ error: "Unauthorized" }, { headers: { "Set-Cookie": await commitSession(session) } });
        }
        try {
            const postdata = {
                id: id,
            };
            const { data: data } = await PostRequest("/anime/delete", postdata, session.get("auth"));
            return { success: true };
        } catch (error) {
            const err = await IsError(error);
            console.log(err);
            switch (err) {
                case "Unauthorized":
                    session.unset("auth");
                    return json({ error: "Unauthorized" }, { headers: { "Set-Cookie": await commitSession(session) } });
                default:
                    return { error: "Ismeretlen Hiba" };
            }
        }
    }
    if (type === "save") {
        const session = await getSession(request.headers.get("Cookie"));
        if (!session.has("auth")) {
            session.unset("auth");
            return json({ error: "Unauthorized" }, { headers: { "Set-Cookie": await commitSession(session) } });
        }
        try {
            const { data: datas } = await PostRequest("/anime/save", data, session.get("auth"));
            return { success: true };
        } catch (error) {
            const err = await IsError(error);
            console.log(err);
            switch (err) {
                case "Unauthorized":
                    session.unset("auth");
                    return json({ error: "Unauthorized" }, { headers: { "Set-Cookie": await commitSession(session) } });
                default:
                    return { error: "Ismeretlen Hiba" };
            }
        }
    }
};

export const shouldRevalidate: ShouldRevalidateFunction = ({ actionResult, defaultShouldRevalidate }) => {
    if (actionResult) {
        if (actionResult.error || actionResult.success) {
            return false;
        }
    }
    return defaultShouldRevalidate;
};
