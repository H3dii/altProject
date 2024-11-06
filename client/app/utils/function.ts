import slugify from "slugify";

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const setMeta = (matches: any, data: any) => {
    const parentMeta = matches.flatMap((match: any) => match.meta ?? []);

    const metaMap = new Map<string, any>();

    [...parentMeta, ...data].forEach((meta) => {
        const key = meta.name || meta.property || meta.title;
        if (key) {
            metaMap.set(key, meta);
        }
    });

    return Array.from(metaMap.values());
};

export const formatTitleToSlug = (title: string) => {
    return slugify(title, {
        lower: true,
        replacement: "_",
        remove: /[*+~.()'"!:@]/g,
    });
};
