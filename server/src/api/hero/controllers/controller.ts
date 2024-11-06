import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::hero.hero", () => ({
    async getHero(ctx, next) {
        const heros = await strapi.query("api::hero.hero").findMany({ orderBy: { createdAt: "desc" }, populate: { news: { populate: { background: true } }, anime: { populate: { background: true, genres: true } } } });
        if (heros.length === 0) return ctx.send("notFound", 404);
        const resHero = [];

        for (const hero of heros) {
            if (hero.anime) {
                const genres = [];
                for (const genre of hero.anime.genres) {
                    genres.push({ name: genre.name, id: genre.id });
                }
                resHero.push({
                    id: hero.anime.id,
                    type: "anime",
                    title: hero.anime.title,
                    description: hero.anime.description,
                    cover: hero.anime.cover || null,
                    background: hero.anime.background || null,
                    genres: genres,
                });
            } else {
                resHero.push({
                    id: hero.news.id,
                    type: "news",
                    title: hero.news.title,
                    shortText: hero.news.shortText,
                    background: hero.news.background[0].url || null,
                });
            }
        }

        return ctx.send(resHero);
    },
}));
