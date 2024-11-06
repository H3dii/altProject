import { factories } from "@strapi/strapi";
export default factories.createCoreController("api::genre.genre", () => ({
    async getGenre(ctx) {
        const genres = await strapi.query("api::genre.genre").findMany();
        const response = genres.map((genre) => ({
            id: genre.id,
            malid: genre.malid,
            name: genre.name,
        }));
        return ctx.send(response);
    },
}));
