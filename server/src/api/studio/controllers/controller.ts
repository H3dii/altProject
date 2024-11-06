import { factories } from "@strapi/strapi";
export default factories.createCoreController("api::studio.studio", () => ({
    async getStudio(ctx) {
        const studios = await strapi.query("api::studio.studio").findMany();
        const response = studios.map((studio) => ({
            id: studio.id,
            malid: studio.malid,
            name: studio.name,
        }));
        return ctx.send(response);
    },
}));
