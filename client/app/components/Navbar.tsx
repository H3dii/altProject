import { Link, useFetcher, useLocation, useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import LazyImage from "./LazyImages";
import config from "~/utils/config";
import Icon from "./Icons";
import { UserData } from "~/utils/types";
import { toast } from "react-toastify";

export default function Navbar({ user }: { user: UserData | null }) {
    const [isAnimeOpen, setAnimeOpen] = useState<boolean>(false);
    const [IsUserOpen, setUserOpen] = useState<boolean>(false);
    const [minboxOpen, setMiniboxOpen] = useState<boolean>(false);
    const logoutFetch = useFetcher();
    const AnimeBoxRef = useRef<HTMLDivElement | null>(null);
    const UserBoxRef = useRef<HTMLDivElement | null>(null);
    const UserBoxRef2 = useRef<HTMLDivElement | null>(null);
    const AnimeBoxRef2 = useRef<HTMLDivElement | null>(null);
    const MininavRef = useRef<HTMLDivElement | null>(null);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get("status");
    useEffect(() => {
        setAnimeOpen(false);
        setUserOpen(false);
        setMiniboxOpen(false);
    }, [location]);
    useEffect(() => {
        const handleOutSideClick = (e: Event) => {
            if (AnimeBoxRef.current && !AnimeBoxRef.current.contains(e.target as Node) && AnimeBoxRef2.current && !AnimeBoxRef2.current.contains(e.target as Node)) {
                setAnimeOpen(false);
            }
            if (UserBoxRef.current && !UserBoxRef.current.contains(e.target as Node) && UserBoxRef2.current && !UserBoxRef2.current.contains(e.target as Node)) {
                setUserOpen(false);
            }
            if (MininavRef.current && !MininavRef.current.contains(e.target as Node)) {
                setMiniboxOpen(false);
            }
        };
        window.addEventListener("click", handleOutSideClick);
        return () => {
            window.removeEventListener("click", handleOutSideClick);
        };
    }, []);

    const navigate = useNavigate();
    useEffect(() => {
        if (logoutFetch.data) {
            toast.success("Sikeres kijelentkezés");
            navigate("/");
        }
    }, [logoutFetch.data]);

    return (
        <header className="sticky top-0 left-0 flex  w-full h-[4rem] px-4 gap-4 z-50 items-center justify-between bg-neutral-900/80 backdrop-blur">
            <nav className="w-full flex items-center justify-start gap-4">
                <Link to="/" className="flex items-center gap-2" aria-label="Kezdőlap">
                    <LazyImage src="/logo.png" alt={`${config.SITENAME} Logo`} className="w-[2.5rem] rounded-full" />
                    <h1 className="text-lg font-medium uppercase">
                        OTA<span className="text-sky-500">MOON</span>
                    </h1>
                </Link>
            </nav>
            <nav className="sm:hidden flex w-full items-center justify-end gap-2 relative">
                <Link to="/discord" aria-label="Discord Szerverünk" className="group flex items-center hover:bg-neutral-700/50 p-2 rounded-full">
                    <Icon name="FaDiscord" className="text-2xl group-hover:text-sky-500 group-hover:rotate-180 duration-200" />
                </Link>
                {user ? (
                    <div className="relative flex items-center" ref={UserBoxRef2}>
                        <button onClick={() => setUserOpen(!IsUserOpen)} aria-label="Profile">
                            <LazyImage src={user.avatar ? user.avatar : "/profile.png"} alt={`${user.username} profile`} className="cursor-pointer min-w-[2.2rem] min-h-[2.2rem] max-w-[2.2rem] max-h-[2.2rem] rounded-full" />
                        </button>
                        <div className={`${IsUserOpen ? "top-16 opacity-100 pointer-events-auto" : "top-12 opacity-0 pointer-events-none"} duration-200 absolute right-0 bg-neutral-900/80 backdrop-blur shadow-md drop-shadow-md rounded-md p-2 flex flex-col gap-2`}>
                            {user.role.type === "owner" && (
                                <Link to={`/dashboard`} aria-label="Admin panel" className={`${location.pathname === "/dashboard" ? "text-sky-500" : ""} hover:text-sky-500 w-full p-2 flex items-center gap-2 group whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                                    <Icon name="MdDashboard" />
                                    Dashboard
                                </Link>
                            )}
                            <Link to={`/profile/${user.username}`} aria-label="Profilod" className={`${location.pathname === "/profile" ? "text-sky-500" : ""} hover:text-sky-500 w-full p-2 flex items-center gap-2 group whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                                <Icon name="FaUser" />
                                Profilom
                            </Link>
                            <Link to={`/animelist/${user.username}`} aria-label="Anime lista" className={`${location.pathname === "/animelist" ? "text-sky-500" : ""} hover:text-sky-500 w-full p-2 flex items-center gap-2 group whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                                <Icon name="FaList" />
                                Anime listám
                            </Link>
                            <Link to={`/history/${user.username}`} aria-label="Előzmények" className={`${location.pathname === "/history" ? "text-sky-500" : ""} hover:text-sky-500 w-full p-2 flex items-center gap-2 group whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                                <Icon name="FaHistory" />
                                Előzmények
                            </Link>
                            <Link to={`/settings`} aria-label="Beállítások" className={`${location.pathname === "/settings" ? "text-sky-500" : ""} hover:text-sky-500 w-full p-2 flex items-center gap-2 group whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                                <Icon name="FaCog" />
                                Beállítások
                            </Link>
                            <Link to={"/logout"} aria-label="Kijelentkezés" className={`hover:text-rose-500 cursor-pointer w-full group p-2 flex items-center gap-2 whitespace-nowrap pr-4 text-lg font-medium hover:bg-rose-700/50 duration-200 rounded-md`}>
                                <Icon name="MdLogout" className="rotate-180" />
                                Kijelentkezés
                            </Link>
                        </div>
                    </div>
                ) : (
                    <Link to="/login" aria-label="Bejelentkezés" className="group flex items-center hover:bg-neutral-700/50 p-2 rounded-full">
                        <Icon name="FaUser" className="text-2xl group-hover:text-sky-500 duration-200" />
                    </Link>
                )}
                <div className="relative" ref={MininavRef}>
                    <button onClick={() => setMiniboxOpen(!minboxOpen)} aria-label="mobile navigáció" className="group flex items-center hover:bg-neutral-700/50 p-2 rounded-full">
                        <Icon name="RxHamburgerMenu" className={`${minboxOpen ? "opacity-0 rotate-180" : "opacity-100 rotate-0"} group-hover:text-sky-500  duration-200 text-3xl`} />
                        <Icon name="VscChromeClose" className={`${minboxOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-180"} group-hover:text-sky-500 duration-200 text-3xl absolute`} />
                    </button>
                    <div className={`${minboxOpen ? "opacity-100 pointer-events-auto right-[0]" : "right-[0] w-0 p-0 pr-0 opacity-0 pointer-events-none"} top-[4rem] fixed overflow-hidden duration-200 flex flex-col w-[15rem] rounded-bl-md h-[calc(100vh_-_4rem)] p-2 pr-4 gap-1 z-50 items-start justify-start bg-neutral-900/80 backdrop-blur`}>
                        <Link to={"/"} aria-label="Kezdőlap" className={`${location.pathname === "/" ? "text-sky-500" : ""} w-full p-2 flex items-center group whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                            Kezdőlap
                        </Link>
                        <Link to={"/news"} aria-label="Hírek" className={`${location.pathname === "/news" ? "text-sky-500" : ""} w-full p-2 flex items-center group whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                            Hírek
                        </Link>
                        <Link to={`/anime`} aria-label="Kereső" className={`${location.pathname === "/anime" ? "text-sky-500" : ""} w-full p-2 flex items-center group whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                            Kereső
                        </Link>
                        <div ref={AnimeBoxRef2} className="relative w-full">
                            <button onClick={() => setAnimeOpen(!isAnimeOpen)} aria-label="anime fül" className={`${isAnimeOpen ? "text-sky-500" : "hover:text-sky-500"} ${location.pathname === "/anime" ? "text-sky-500" : ""}  w-full p-2 flex items-center gap-1 group whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                                Anime
                                <Icon name="FaCaretDown" className={`text-md ${isAnimeOpen ? "rotate-180 text-sky-500" : "rotate-0 group-hover:text-sky-500"}  duration-200`} />
                            </button>
                            <div className={`${isAnimeOpen ? "h-full opacity-100 pointer-events-auto mt-2" : "h-0 opacity-0 pointer-events-none"} overflow-hidden duration-200 flex flex-col gap-2`}>
                                <Link to={`/`} aria-label="Random anime" className={` w-full p-2 flex items-center gap-2 group whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                                    <Icon name="FaRandom" className="group-hover:text-sky-500  duration-200" />
                                    Random
                                </Link>
                                <Link to={`/anime?q=&status=popular`} className={`${status === "popular" ? "text-sky-500" : ""} w-full p-2 flex items-center gap-2 group whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                                    <Icon name="FaStar" aria-label="Legnézetebb animék" className="group-hover:text-[#ffd700]  duration-200" />
                                    Legnézettebbek
                                </Link>
                                <Link to={`/anime?q=&status=progress`} aria-label="Futto animék" className={`${status === "progress" ? "text-sky-500" : ""} w-full p-2 group flex items-center gap-2 whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                                    <Icon name="FaPlayCircle" className="group-hover:text-[#1e90ff]  duration-200" />
                                    Futó Animék
                                </Link>
                                <Link to={`/anime?q=&status=finished`} aria-label="Befejezett animék" className={`${status === "finished" ? "text-sky-500" : ""} w-full p-2 flex group items-center gap-2 whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                                    <Icon name="FaRegClock" className="group-hover:text-[#1e90ff]  duration-200" />
                                    Befejezett Animék
                                </Link>
                                <Link to={`/anime?q=&status=upcoming`} aria-label="Közelgő animék" className={`${status === "upcoming" ? "text-sky-500" : ""} w-full group p-2 flex items-center gap-2 whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                                    <Icon name="FaClock" className="group-hover:text-[#ffab40]  duration-200" />
                                    Közelgő Újdonságok
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <nav className="sm:flex hidden w-full  items-center justify-end gap-4">
                <Link to={"/"} aria-label="Kezdőlap" className={`${location.pathname === "/" ? "text-sky-500" : ""} text-lg font-medium hover:text-sky-500 duration-200`}>
                    Kezdőlap
                </Link>
                <Link to={"/news"} aria-label="Hírek" className={`${location.pathname === "/news" ? "text-sky-500" : ""} text-lg font-medium hover:text-sky-500 duration-200`}>
                    Hírek
                </Link>
                <div ref={AnimeBoxRef} className="relative">
                    <button onClick={() => setAnimeOpen(!isAnimeOpen)} aria-label="anime fül" className={`${isAnimeOpen ? "text-sky-500" : "hover:text-sky-500"} ${location.pathname === "/anime" ? "text-sky-500" : ""} text-lg font-medium duration-200 flex items-center gap-1`}>
                        Anime
                        <Icon name="FaCaretDown" className={`text-md ${isAnimeOpen ? "rotate-180 text-sky-500" : "rotate-0 group-hover:text-sky-500"}  duration-200`} />
                    </button>
                    <div className={`${isAnimeOpen ? "top-14 opacity-100 pointer-events-auto" : "top-12 opacity-0 pointer-events-none"} duration-200 absolute right-0 bg-neutral-900/80 backdrop-blur shadow-md drop-shadow-md rounded-md p-2 flex flex-col gap-2`}>
                        <Link to={`/anime`} aria-label="Kereső" className={`${location.pathname === "/anime" ? "text-sky-500" : ""} w-full p-2 flex items-center gap-2 group whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                            <Icon name="FaSearch" className="group-hover:text-sky-500 duration-200" />
                            Kereső
                        </Link>
                        <Link to={`/`} className={` w-full p-2 flex items-center gap-2 group whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                            <Icon name="FaRandom" aria-label="Random anime" className="group-hover:text-sky-500  duration-200" />
                            Random
                        </Link>
                        <Link to={`/anime?q=&status=popular`} className={`${status === "popular" ? "text-sky-500" : ""} w-full p-2 flex items-center gap-2 group whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                            <Icon name="FaStar" aria-label="Legnézetebb animék" className="group-hover:text-[#ffd700]  duration-200" />
                            Legnézettebbek
                        </Link>
                        <Link to={`/anime?q=&status=progress`} className={`${status === "progress" ? "text-sky-500" : ""} w-full p-2 group flex items-center gap-2 whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                            <Icon name="FaPlayCircle" aria-label="Futto animék" className="group-hover:text-[#1e90ff]  duration-200" />
                            Futó Animék
                        </Link>
                        <Link to={`/anime?q=&status=finished`} aria-label="Befejezett animék" className={`${status === "finished" ? "text-sky-500" : ""} w-full p-2 flex group items-center gap-2 whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                            <Icon name="FaRegClock" className="group-hover:text-[#1e90ff]  duration-200" />
                            Befejezett Animék
                        </Link>
                        <Link to={`/anime?q=&status=upcoming`} aria-label="Közelgő animék" className={`${status === "upcoming" ? "text-sky-500" : ""} w-full group p-2 flex items-center gap-2 whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                            <Icon name="FaClock" className="group-hover:text-[#ffab40]  duration-200" />
                            Közelgő Újdonságok
                        </Link>
                    </div>
                </div>
                <Link to={"/anime"} aria-label="Kereső" className="lg:hidden flex group items-center hover:bg-neutral-700/50 p-2 rounded-full">
                    <Icon name="MdSearch" className="text-2xl group-hover:text-sky-500 duration-200" />
                </Link>
                <form
                    className="lg:flex hidden"
                    onSubmit={(e) => {
                        e.preventDefault();
                        const { search } = e.target as HTMLFormElement;
                        if (search && search.value.trim() !== "") {
                            navigate(`/anime?q=${search.value}`);
                        } else {
                            navigate(`/anime`);
                        }
                    }}
                >
                    <div className="bg-neutral-800 flex items-center px-4 rounded-md">
                        <input type="text" name="search" placeholder="Keresés..." className="bg-neutral-800  py-2 rounded-md" />
                        <button className="group" aria-label="keresés">
                            <Icon name="MdSearch" className="text-2xl cursor-pointer  group-hover:rotate-90 duration-200" />
                        </button>
                    </div>
                </form>
                <Link to="/discord" aria-label="Discord szerver" className="group flex items-center hover:bg-neutral-700/50 p-2 rounded-full">
                    <Icon name="FaDiscord" className="text-2xl group-hover:text-sky-500 group-hover:rotate-180 duration-200" />
                </Link>
                {user ? (
                    <div className="relative flex items-center" ref={UserBoxRef}>
                        <button onClick={() => setUserOpen(!IsUserOpen)} aria-label="profile">
                            <LazyImage src={user.avatar ? user.avatar : "/profile.png"} alt={user.username} className="cursor-pointer min-w-[2.4rem] min-h-[2.4rem] max-w-[2.4rem] max-h-[2.4rem] rounded-full" />
                        </button>
                        <div className={`${IsUserOpen ? "top-16 opacity-100 pointer-events-auto" : "top-12 opacity-0 pointer-events-none"} duration-200 absolute right-0 bg-neutral-900/80 backdrop-blur shadow-md drop-shadow-md rounded-md p-2 flex flex-col gap-2`}>
                            {user.role.type === "owner" && (
                                <Link to={`/dashboard`} aria-label="Admin panel" className={`${location.pathname === "/dashboard" ? "text-sky-500" : ""} hover:text-sky-500 w-full p-2 flex items-center gap-2 group whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                                    <Icon name="MdDashboard" />
                                    Dashboard
                                </Link>
                            )}
                            <Link to={`/profile/${user.username}`} aria-label="Profilom" className={`${location.pathname === "/profile" ? "text-sky-500" : ""} hover:text-sky-500 w-full p-2 flex items-center gap-2 group whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                                <Icon name="FaUser" />
                                Profilom
                            </Link>
                            <Link to={`/animelist/${user.username}`} aria-label="Anime lista" className={`${location.pathname === "/animelist" ? "text-sky-500" : ""} hover:text-sky-500 w-full p-2 flex items-center gap-2 group whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                                <Icon name="FaList" />
                                Anime listám
                            </Link>
                            <Link to={`/history/${user.username}`} aria-label="Előzmények" className={`${location.pathname === "/history" ? "text-sky-500" : ""} hover:text-sky-500 w-full p-2 flex items-center gap-2 group whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                                <Icon name="FaHistory" />
                                Előzmények
                            </Link>
                            <Link to={`/settings`} aria-label="Beállítások" className={`${location.pathname === "/settings" ? "text-sky-500" : ""} hover:text-sky-500 w-full p-2 flex items-center gap-2 group whitespace-nowrap pr-4 text-lg font-medium hover:bg-neutral-700/50 duration-200 rounded-md`}>
                                <Icon name="FaCog" />
                                Beállítások
                            </Link>
                            <Link to={"/logout"} aria-label="Kijelentkezés" className={`hover:text-rose-500 cursor-pointer w-full group p-2 flex items-center gap-2 whitespace-nowrap pr-4 text-lg font-medium hover:bg-rose-700/50 duration-200 rounded-md`}>
                                <Icon name="MdLogout" className="rotate-180" />
                                Kijelentkezés
                            </Link>
                        </div>
                    </div>
                ) : (
                    <Link to="/login" aria-label="Bejelentkezés" className="group flex items-center hover:bg-neutral-700/50 p-2 rounded-full">
                        <Icon name="FaUser" className="text-2xl group-hover:text-sky-500 duration-200" />
                    </Link>
                )}
            </nav>
        </header>
    );
}
