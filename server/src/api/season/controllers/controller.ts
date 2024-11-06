import { factories } from "@strapi/strapi";
export default factories.createCoreController("api::season.season", () => ({
    async getSeason(ctx) {
        const seasons = await strapi.query("api::season.season").findMany();
        const response = seasons.map((season) => ({
            id: season.id,
            year: season.year,
            season: season.season,
        }));
        return ctx.send(response);
    },
}));
