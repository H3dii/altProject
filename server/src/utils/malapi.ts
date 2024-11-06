export const GetGenre = async (genres: { id: number; name: string }[]): Promise<{ id: number }[]> => {
    const genreIdsToCheck = genres.map((g) => g.id);

    const existingGenres = await strapi.query("api::genre.genre").findMany({
        where: { malid: { $in: genreIdsToCheck } },
        select: ["malid"],
    });

    const existingGenresIds = existingGenres.map((g) => g.malid);

    for (const g of genres) {
        if (!existingGenresIds.includes(g.id)) {
            await strapi.query("api::genre.genre").create({
                data: {
                    malid: g.id,
                    name: g.name,
                },
            });
        }
    }
    const ResponseGenres = await strapi.query("api::genre.genre").findMany({
        where: { malid: { $in: genreIdsToCheck } },
        select: ["id"],
    });
    return ResponseGenres;
};

export const GetStudio = async (studio: { id: number; name: string }[]): Promise<{ id: number }[]> => {
    const studiosIdsToCheck = studio.map((g) => g.id);

    const existingStudios = await strapi.query("api::studio.studio").findMany({
        where: { malid: { $in: studiosIdsToCheck } },
        select: ["malid"],
    });
    const existingStudioIds = existingStudios.map((g) => g.malid);

    for (const g of studio) {
        if (!existingStudioIds.includes(g.id)) {
            await strapi.query("api::studio.studio").create({
                data: {
                    malid: g.id,
                    name: g.name,
                },
            });
        }
    }
    const ResponseStudios = await strapi.query("api::studio.studio").findMany({
        where: { malid: { $in: studiosIdsToCheck } },
        select: ["id"],
    });
    return ResponseStudios;
};

export const GetSesson = async (sesson: { start_season: { year: number; season: string } }): Promise<{ id: number }> => {
    //console.log(sesson);
    const existingSesson = await strapi.query("api::season.season").findOne({
        where: { year: sesson.start_season.year, season: sesson.start_season.season },
    });
    console.log(existingSesson);
    if (!existingSesson) {
        await strapi.query("api::season.season").create({
            data: {
                year: sesson.start_season.year,
                season: sesson.start_season.season,
            },
        });
    }
    const ResponseSesson = await strapi.query("api::season.season").findOne({
        where: { year: sesson.start_season.year, season: sesson.start_season.season },
    });
    return ResponseSesson.id;
};
