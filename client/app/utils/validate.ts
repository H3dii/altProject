import { ActionFunctionArgs } from "@remix-run/node";

interface ValidationSettings {
    required?: boolean;
    minLength?: number;
    email?: boolean;
    mal?: boolean;
}

interface CustomErrorMessages {
    required?: string;
    minLength?: string;
    email?: string;
    mal?: string;
}

export const validate = (value: string, settings: ValidationSettings, customErrorMessages?: CustomErrorMessages): string | undefined => {
    if (settings.required && !value) {
        return customErrorMessages?.required || "This field is required.";
    }

    if (settings.minLength && value.length < settings.minLength) {
        return customErrorMessages?.minLength?.replace("{minLength}", `${settings.minLength}`) || `This field must contain at least ${settings.minLength} characters.`;
    }

    if (settings.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
        return customErrorMessages?.email || "Please enter a valid email address.";
    }

    if (settings.mal && !value.includes("https://myanimelist.net/anime/")) {
        return customErrorMessages?.mal || "Invalid Link https://myanimelist.net/anime/";
    }

    return undefined;
};
