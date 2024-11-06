export default {
    routes: [
        {
            method: "POST",
            path: "/auth/register",
            handler: "controller.register",
        },
        {
            method: "GET",
            path: "/auth/confirm/:TOKEN",
            handler: "controller.confirm",
        },
        {
            method: "POST",
            path: "/auth/login",
            handler: "controller.login",
        },
        {
            method: "GET",
            path: "/auth/me",
            handler: "controller.me",
        },
    ],
};
