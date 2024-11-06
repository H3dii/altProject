import { Navigation, Autoplay, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Icon from "./Icons";
import { useRef, useState } from "react";
import { ModalComponent } from "./Modal";
import LazyImage from "./LazyImages";
import config from "~/utils/config";
import { Link, useFetcher, useNavigate, useRouteLoaderData } from "@remix-run/react";
import { UserData } from "~/utils/types";
import { toast } from "react-toastify";
import { Fetcher } from "~/utils/fetcher";
import { formatTitleToSlug } from "~/utils/function";
export default function Hero({ hero }: { hero: any }) {
    const previewModalRef = useRef<any>(null);
    const { user } = useRouteLoaderData("root") as { user: UserData | null };
    const [modalData, setModalData] = useState<any>(null);
    const navigate = useNavigate();
    const openPreview = (data: any) => {
        setModalData(data);
        previewModalRef.current?.open(true);
        previewModalRef.current?.width("60rem");
    };

    const gotToAnime = (data: any) => {
        if (user) {
            navigate(`/anime/${data.id}/${formatTitleToSlug(data.title)}`);
        } else {
            toast.error("Előbb jelenetkez be");
            navigate("/login");
        }
    };

    return (
        <>
            {hero && (
                <main className="overflow-hidden w-full mt-[-4rem] ">
                    <Swiper
                        modules={[Navigation, Autoplay, A11y]}
                        speed={600}
                        autoplay={{ delay: 5000 }}
                        slidesPerView={1}
                        navigation={{
                            nextEl: ".image-swiper-button-next",
                            prevEl: ".image-swiper-button-prev",
                        }}
                        loop
                        className="h-full"
                    >
                        {hero.map((data: any, i: number) => (
                            <SwiperSlide key={i}>
                                <div className="w-full h-screen relative flex justify-center">
                                    <LazyImage src={`${config.IMAGEHOST}${data.background}`} alt={data.title} className="w-full h-full blur object-cover object-center absolute brightness-[20%] z-[-1]" />
                                    <div className="max-w-[1920px] w-full h-full flex lg:flex-row flex-col-reverse items-center sm:justify-between justify-center xl:px-40 px-20  lg:pt-[4.5rem] pt-[6rem] lg:pb-5 pb-[4rem] gap-8">
                                        <div className="2xl:w-[40%] lg:w-[60%] w-full flex flex-col gap-6">
                                            {data.type === "anime" && <h1 className="border-l-2 border-sky-500 pl-2 text-sm font-semibold">ANIME: {data.id}</h1>}
                                            {data.type === "news" && <h1 className="border-l-2 border-sky-500 pl-2 text-sm font-semibold">NEWS: {data.id}</h1>}
                                            <h1 className="font-bold lg:text-5xl sm:text-4xl text-3xl">{data.title}</h1>
                                            <p className="line-clamp-5 leading-7">
                                                {data.type === "anime" && data.description}
                                                {data.type === "news" && data.shortText}
                                            </p>
                                            {data.type === "anime" && (
                                                <ul className="flex flex-col gap-4">
                                                    <li>
                                                        <span className="text-sky-500 font-semibold">Szezon:</span> Fall 2024
                                                    </li>
                                                    <li>
                                                        <span className="text-sky-500 font-semibold">Műfaj:</span>{" "}
                                                        {data.genres.map((genre: any, i: number) => (
                                                            <Link to={`/anime?genre=${genre.id}`} className="hover:underline hover:text-sky-500 duration-200" key={i}>
                                                                {genre.name},{" "}
                                                            </Link>
                                                        ))}
                                                    </li>
                                                </ul>
                                            )}
                                            <div className="flex items-center gap-4">
                                                {data.type === "anime" && (
                                                    <>
                                                        <button onClick={() => gotToAnime(data)} className="bg-sky-500 hover:bg-sky-700 duration-200 w-max px-4 pr-6 py-2 rounded-md text-lg font-semibold flex items-center justify-center">
                                                            <Icon name="MdPlayArrow" className="text-3xl" />
                                                            Megtekintés
                                                        </button>
                                                    </>
                                                )}
                                                {data.type === "news" && (
                                                    <>
                                                        <Link to={`/news/${data.id}/${formatTitleToSlug(data.title)}`} className="bg-sky-500 hover:bg-sky-700 duration-200 w-max px-4 pr-6 py-2 rounded-md text-lg font-semibold flex items-center justify-center">
                                                            <Icon name="MdNewspaper" className="text-3xl" />
                                                            Mutas többet
                                                        </Link>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex aspect-video lg:w-[38rem] w-full rounded-md  flex-col items-center justify-center border-2 relative border-white/25">
                                            <LazyImage src={config.IMAGEHOST + data.background} alt={data.title} className="w-full object-cover object-center absolute z-[-1]  brightness-[60%]" />
                                            {data.type === "anime" && (
                                                <>
                                                    <button onClick={() => openPreview(data)} className="hover:border-white group border-2 border-transparent rounded-full duration-200">
                                                        <Icon name="MdPlayArrow" className="text-6xl group-hover:rotate-[360deg] duration-500" />
                                                    </button>
                                                    <h1>Előzetes megtekintése</h1>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                        <div className="absolute inset-y-0 left-4 z-10 flex items-center">
                            <button className="image-swiper-button-prev">
                                <Icon name="MdArrowBackIosNew" className="text-4xl" />
                            </button>
                        </div>
                        <div className="absolute inset-y-0 right-4 z-10 flex items-center">
                            <button className="image-swiper-button-next">
                                <Icon name="MdArrowForwardIos" className="text-4xl" />
                            </button>
                        </div>
                    </Swiper>
                </main>
            )}
            <ModalComponent ref={previewModalRef}>
                <div className="flex items-center justify-center flex-col">
                    <h1 className="lg:text-5xl md:text-3xl text-xl font-bold text-center mx-10">{modalData && modalData.title}</h1>
                    <h2 className="lg:text-2xl md:text-xl text-md text-center mb-4">Előzetes</h2>
                    <iframe src="https://www.youtube-nocookie.com/embed/OdQrlp3uYQM?si=6WWNueq285YnfNTP&rel=0" allow="fullscreen" className="w-full aspect-video" style={{ border: "none" }} allowFullScreen></iframe>
                </div>
            </ModalComponent>
        </>
    );
}
