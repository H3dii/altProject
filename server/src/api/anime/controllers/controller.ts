import { factories } from "@strapi/strapi";
import { CONFIG } from "../../../../env";
import axios from "axios";
import { GetGenre, GetSesson, GetStudio } from "../../../utils/malapi";
import { TranslteAnime } from "../../../utils/translate";
import { formatDate } from "../../../utils/function";

export default factories.createCoreController("api::anime.anime", () => ({
    async getAnime(ctx) {
        const { page = 1 } = ctx.query as { page: number };
        const limit = 25;
        const offset = (page - 1) * limit;

        const [totalEntries, entries] = await Promise.all([
            strapi.entityService.count("api::anime.anime"),
            strapi.entityService.findMany("api::anime.anime", {
                where: ctx.state.user ? (ctx.state.user?.role?.type !== "owner" ? { published: true } : undefined) : { published: true },
                limit,
                start: offset,
                sort: { createdAt: "desc" },
            }),
        ]);
        if (entries.length > 0) {
            let dataResponse;
            if (ctx.state.user && ctx.state.user.role.type === "owner") {
                dataResponse = entries.map((data: any) => ({
                    id: data.id,
                    title: data.title,
                    cover: data.cover,
                    published: data.published,
                }));
            } else {
                dataResponse = entries.map((data: any) => ({
                    id: data.id,
                    title: data.title,
                    cover: data.cover,
                }));
            }

            return ctx.send({
                data: dataResponse,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalEntries / limit),
                    totalEntries,
                },
            });
        } else {
            return ctx.send({ message: "notFound" }, 404);
        }
    },

    async createAnime(ctx) {
        if (!ctx.state.user || !ctx.state.user.id) return ctx.send({ error: "Unauthorized" }, 401);
        if (ctx.state.user.role.type !== "owner") return ctx.send({ error: "Unauthorized" }, 401);

        const { body } = ctx.request;
        const id = body.mal.split("/")[4];
        const isAnimeTaken = await strapi.query("api::anime.anime").findOne({
            where: {
                malid: id,
            },
        });
        if (isAnimeTaken) return ctx.send({ error: "Tihs anime is taken" }, 400);
        try {
            const { data: animeData } = await axios.get(`${CONFIG.MAL.replace("{MALLID}", id)}`, { headers: { "X-MAL-CLIENT-ID": `${CONFIG.MALKEY}` } });

            const animecreate = await strapi.query("api::anime.anime").create({
                data: {
                    malid: animeData.id,
                    title: animeData.title,
                    description: await TranslteAnime(animeData.title),
                    cover: animeData.main_picture.medium || animeData.main_picture.large || null,
                    genres: (await GetGenre(animeData.genres)).map((g) => ({ id: g.id })),
                    published: false,
                    nsfw: animeData.nsfw !== "white",
                    media_type: animeData.media_type,
                    status_type: animeData.status,
                    num_episodes: animeData.num_episodes,
                    start_date: animeData.start_date,
                    end_date: animeData.end_date,
                    average_episode_duration: animeData.average_episode_duration,
                    studios: (await GetStudio(animeData.studios)).map((g) => ({ id: g.id })),
                    season: await GetSesson(animeData),
                    alternative_titles: animeData.alternative_titles,
                },
            });
            return ctx.send(animecreate.id);
        } catch (error) {
            console.log(error);
            if (error.response.data) {
                return ctx.send(error.response.data.message, 400);
            } else {
                return ctx.send("undifended", 400);
            }
        }
    },

    async getAnimeWithID(ctx) {
        const { ID } = ctx.params;
        const data = await strapi.query("api::anime.anime").findOne({ where: { id: ID }, populate: { genres: true, studios: true, season: true } });
        const response = {
            id: data.id,
            mailid: data.malid,
            title: data.title,
            description: data.description,
            cover: data.cover,
            published: data.published,
            nsfw: data.nsfw,
            media_type: data.media_type,
            status_type: data.status_type,
            num_episodes: data.num_episodes,
            average_episode_duration: data.average_episode_duration,
            current_episodes: data.current_episodes,
            start_date: data.start_date,
            end_date: data.end_date,
            alternative_titles: data.alternative_titles,
            genres: data.genres.map((genre: { id: number; malid: number; name: string }) => ({
                id: genre.id,
                malid: genre.malid,
                name: genre.name,
            })),
            season: {
                id: data.season.id,
                year: data.season.year,
                season: data.season.season,
            },
            studios: data.studios.map((studio: { id: number; malid: number; name: string }) => ({
                id: studio.id,
                malid: studio.malid,
                name: studio.name,
            })),
        };
        return ctx.send(response);
    },

    async deleteAnime(ctx) {
        if (!ctx.state.user || !ctx.state.user.id) return ctx.send({ error: "Unauthorized" }, 401);
        if (ctx.state.user.role.type !== "owner") return ctx.send({ error: "Unauthorized" }, 401);
        const { id } = ctx.request.body;
        await strapi.query("api::anime.anime").delete({ where: { id } });
        return ctx.send({ message: "deleted" });
    },

    async saveAnime(ctx) {
        if (!ctx.state.user || !ctx.state.user.id) return ctx.send({ error: "Unauthorized" }, 401);
        if (ctx.state.user.role.type !== "owner") return ctx.send({ error: "Unauthorized" }, 401);
        const { body } = ctx.request;
        await strapi.query("api::anime.anime").update({
            data: {
                title: body.title,
                alternative_titles: {
                    synonyms: [body["alternative_titles.synonyms"] || ""],
                    en: body["alternative_titles.en"] || "",
                    ja: body["alternative_titles.ja"] || "",
                },
                description: body.description,
                published: body.published === "1",
                status_type: body.status_type,
                media_type: body.media_type,
                num_episodes: body.num_episodes,
                average_episode_duration: body.average_episode_duration,
                start_date: body.start_date !== "null" ? await formatDate(body.start_date) : undefined,
                end_date: body.end_date !== "null" ? await formatDate(body.end_date) : undefined,
                genres: body.genres.map((genre: number) => genre),
                studios: body.studios.map((studio: number) => studio),
                season: body.season,
            },
            where: {
                id: body.id,
            },
        });
        return ctx.send({ message: "saved" });
    },
}));
