import { PassThrough } from "node:stream";
import type { AppLoadContext, EntryContext } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { createInstance } from "i18next";
import i18next from "./localization/i18next.server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import Backend from "i18next-fs-backend";
import i18n from "./localization/i18n"; // az i18n konfigurációs fájlod
import { resolve } from "node:path";
import { SocketProvider } from "./components/SocketContext";
import { getSession } from "./utils/session.server";
import config from "./utils/config";

const ABORT_DELAY = 5000;

export default async function handleRequest(request: Request, responseStatusCode: number, responseHeaders: Headers, remixContext: EntryContext, loadContext: AppLoadContext) {
    const languagesEnabled = config.language;
    const callbackName = isbot(request.headers.get("user-agent")) ? "onAllReady" : "onShellReady";

    const instance = createInstance();
    if (languagesEnabled) {
        const locale = (await getSession(request.headers.get("Cookie"))).get("locale");
        const iploc = await i18next.getLocale(request);
        const lng = locale || iploc;
        const ns = i18next.getRouteNamespaces(remixContext);

        await instance
            .use(initReactI18next)
            .use(Backend)
            .init({
                ...i18n,
                lng,
                ns,
                backend: { loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json") },
            });
    }

    return new Promise((resolve, reject) => {
        let didError = false;

        const { pipe, abort } = renderToPipeableStream(
            languagesEnabled ? (
                <I18nextProvider i18n={instance}>
                    <SocketProvider>
                        <RemixServer context={remixContext} url={request.url} />
                    </SocketProvider>
                </I18nextProvider>
            ) : (
                <SocketProvider>
                    <RemixServer context={remixContext} url={request.url} />
                </SocketProvider>
            ),
            {
                [callbackName]: () => {
                    const body = new PassThrough();
                    const stream = createReadableStreamFromReadable(body);
                    responseHeaders.set("Content-Type", "text/html");

                    resolve(
                        new Response(stream, {
                            headers: responseHeaders,
                            status: didError ? 500 : responseStatusCode,
                        })
                    );

                    pipe(body);
                },
                onShellError(error: unknown) {
                    reject(error);
                },
                onError(error: unknown) {
                    didError = true;
                    console.error(error);
                },
            }
        );

        setTimeout(abort, ABORT_DELAY);
    });
}