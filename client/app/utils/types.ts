export type Locales = {
    name: string;
    tag: string;
    icon: string;
};

export type UserData = {
    id: string;
    username: string;
    email: string;
    global_name: string | null;
    role: { name: string; type: string };
    avatar: string | null;
};

export type SelectType = {
    label: string;
    value: string | number | boolean;
};

export type animeType = {
    id: number;
    mailid: number;
    title: string;
    description: string;
    cover: string;
    published?: boolean;
    nsfw: boolean;
    media_type: string;
    status_type: string;
    num_episodes: number;
    average_episode_duration: number;
    current_episodes: number;
    start_date: string;
    end_date: string;
    alternative_titles?: { synonyms?: string[]; en?: string; ja?: string };
    genres: { id: number; malid: number; name: string }[];
    season: { id: number; year: number; season: string };
    studios: { id: number; malid: number; name: string }[];
};

export type modalType = {
    open: () => void;
    close: () => void;
    width: (w: string) => void;
    height: (h: string) => void;
};

export type genreType = {
    id: number;
    malid: number;
    name: string;
};
export type seassonType = {
    id: number;
    year: number;
    season: string;
};

export const statuses = [
    { value: "currently_airing", label: "Aktív" },
    { value: "finished_airing", label: "Bejezett" },
    { value: "not_yet_aired ", label: "Hamarosan" },
];

export const publishes = [
    { value: 1, label: "Publikálva" },
    { value: 0, label: "Nincs publikálva" },
];

export const media_type = [
    { value: "pv", label: "PV" },
    { value: "TV", label: "TV" },
];
