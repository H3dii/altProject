export default {
    routes: [
        {
            method: "GET",
            path: "/anime",
            handler: "controller.getAnime",
        },
        {
            method: "GET",
            path: "/anime/:ID",
            handler: "controller.getAnimeWithID",
        },
        {
            method: "POST",
            path: "/anime/create",
            handler: "controller.createAnime",
        },
        {
            method: "POST",
            path: "/anime/delete",
            handler: "controller.deleteAnime",
        },
        {
            method: "POST",
            path: "/anime/save",
            handler: "controller.saveAnime",
        },
    ],
};
