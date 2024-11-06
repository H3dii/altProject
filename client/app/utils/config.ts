type ConfigType = {
    SITENAME: string;
    APIHOST: string;
    IMAGEHOST: string;
    WEBSOCKET: string | false;
    SESSION_SECRETS: string;
    language: boolean;
};

const config: ConfigType = {
    SITENAME: "Otamoon",
    APIHOST: "http://localhost:1337/api",
    IMAGEHOST: "http://localhost:1337",
    WEBSOCKET: false, // HOST OR FALSE,
    SESSION_SECRETS: "",
    language: false,
};

export default config;
