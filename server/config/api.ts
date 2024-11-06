export default {
    rest: {
        defaultLimit: 25,
        maxLimit: 100,
        withCount: true,
    },
    settings: {
        // Példa: 10 MB-ra állítva
        multipart: {
            maxFileSize: 10 * 1024 * 1024,
        },
    },
};
