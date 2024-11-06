interface ValidationSettings {
    required?: boolean;
    minLength?: number;
    email?: boolean;
}

interface CustomErrorMessages {
    required?: string;
    minLength?: string;
    email?: string;
}

export const validate = (value: string, settings: ValidationSettings, customErrorMessages?: CustomErrorMessages): string | undefined => {
    if (settings.required && !value) {
        return "RequiredError";
    }

    if (settings.minLength && value.length < settings.minLength) {
        return `MinLenghtError`;
    }

    if (settings.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
        return "EmailError";
    }

    return undefined;
};
