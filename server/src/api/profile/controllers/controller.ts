import { factories } from "@strapi/strapi";
import { validate } from "../../../utils/validate";
import { checkPassword, generateConfirmationToken, hashPassword } from "../../../utils/function";
import { CONFIG } from "../../../../env";

export default factories.createCoreController("api::profile.profile", () => ({
    async register(ctx, next) {
        const { email, username, password } = ctx.request.body;
        const validEmail = validate(email, { required: true, email: true });
        const validUsername = validate(username, { required: true, minLength: 3 });
        const validPassword = validate(password, { required: true, minLength: 8 });
        if (validEmail || validUsername || validPassword) return ctx.send({ error: { email: validEmail, username: validUsername, password: validPassword } }, 400);
        const isEmailTaken = await strapi.query("plugin::users-permissions.user").findOne({ where: { email } });
        const isUsernameTaken = await strapi.query("plugin::users-permissions.user").findOne({ where: { username } });
        if (isEmailTaken || isUsernameTaken) return ctx.send({ error: { email: isEmailTaken && "Taken", username: isUsernameTaken && "Taken" } }, 400);
        const confirmationToken = await generateConfirmationToken(email);
        await strapi.query("plugin::users-permissions.user").create({
            data: {
                email,
                username,
                password: await hashPassword(password),
                confirmed: false,
                confirmationToken: confirmationToken,
                provider: "local",
                role: 1,
            },
        });
        await strapi.plugins["email"].services.email.send({
            to: email,
            from: "noreply@otamoon.hu", //e.g. single sender verification in SendGrid
            cc: email,
            bcc: email,
            replyTo: email,
            subject: "Regiszráció megerősítése",
            html: `
                <h1>Regiszráció megerésítése</h1>
                <p>Kedves ${username}!</p>
                <p>Meg kell erősítenie e-mail címét. Kérjük, kattintson az alábbi linkre.</p>
                <p>${CONFIG.SERVERURL}/auth/confirm/${confirmationToken}</p>`,
        });
        ctx.send({ success: "Ok" });
    },

    async confirm(ctx, next) {
        const { TOKEN } = ctx.params;
        console.log(TOKEN);
        const find = await strapi.query("plugin::users-permissions.user").findOne({
            where: {
                confirmationToken: TOKEN,
            },
        });
        if (find) {
            await strapi.query("plugin::users-permissions.user").update({
                where: {
                    id: find.id,
                },
                data: {
                    confirmationToken: null,
                    confirmed: true,
                },
            });
            return ctx.redirect(`${CONFIG.WEBISTE}/login?confirmed=true`);
        }
        ctx.send({ error: "Invalid Token" }, 400);
    },
    async login(ctx, next) {
        const { idetified, password } = ctx.request.body;
        const validIdetified = validate(idetified, { required: true });
        const validPassword = validate(password, { required: true });
        if (validIdetified || validPassword) return ctx.send({ error: { idetified: validIdetified, password: validPassword } }, 400);
        const user = await strapi.query("plugin::users-permissions.user").findOne({
            where: {
                $or: [{ email: idetified }, { username: idetified }],
            },
        });
        if (user) {
            if (user.confirmed) {
                if (await checkPassword(password, user.password)) {
                    const profile = await strapi.query("api::profile.profile").findOne({
                        where: {
                            user: user.id,
                        },
                    });
                    const jwt = strapi.plugins["users-permissions"].services.jwt.issue({ id: user.id });
                    return ctx.send({
                        user: {
                            id: user.id,
                            username: user.username,
                            global_name: profile ? profile.global_name : null,
                            email: user.email,
                            role: user.role,
                            avatar: profile ? profile.avatar : null,
                        },
                        jwt: jwt,
                    });
                } else {
                    return ctx.send({ error: "wrongLoginData" }, 400);
                }
            } else {
                return ctx.send({ error: "Please confirm your email" }, 400);
            }
        } else {
            return ctx.send({ error: "wrongLoginData" }, 400);
        }
    },

    async me(ctx, next) {
        if (!ctx.state.user || !ctx.state.user.id) return ctx.send({ error: "Unauthorized" }, 401);
        const user = await strapi.query("plugin::users-permissions.user").findOne({
            where: {
                id: ctx.state.user.id,
            },
            populate: {
                profile: true,
                role: true,
            },
        });
        if (user) {
            return ctx.send({
                id: user.id,
                username: user.username,
                global_name: user.profile ? user.profile.global_name : null,
                email: user.email,
                role: { name: user.role.name, type: user.role.type },
                avatar: user.profile ? user.profile.avatar : null,
            });
        } else {
            return ctx.send({ error: "Unauthorized" }, 401);
        }
    },
}));
