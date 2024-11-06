import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import i18n from "./localization/i18n";
import i18next from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { getInitialNamespaces } from "remix-i18next/client";
import { SocketProvider } from "./components/SocketContext";
import config from "./utils/config";

async function hydrate() {
    const languagesEnabled = config.language;

    if (languagesEnabled) {
        await i18next
            .use(initReactI18next)
            .use(LanguageDetector)
            .use(Backend)
            .init({
                ...i18n,
                ns: getInitialNamespaces(),
                backend: { loadPath: "/locales/{{lng}}/{{ns}}.json" },
                detection: {
                    order: ["htmlTag"],
                    caches: [],
                },
            });
    }

    startTransition(() => {
        hydrateRoot(
            document,
            languagesEnabled ? (
                <SocketProvider>
                    <I18nextProvider i18n={i18next}>
                        <RemixBrowser />
                    </I18nextProvider>
                </SocketProvider>
            ) : (
                <SocketProvider>
                    <RemixBrowser />
                </SocketProvider>
            )
        );
    });
}

if (window.requestIdleCallback) {
    window.requestIdleCallback(hydrate);
} else {
    window.setTimeout(hydrate, 1);
}
