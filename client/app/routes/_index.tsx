import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json, useRouteLoaderData } from "react-router-dom";
import Hero from "~/components/Hero";
import { GetRequest, IsError } from "~/utils/api";
import { UserData } from "~/utils/types";
type HeroType = {
    hero: any;
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
    try {
        const { data: hero } = await GetRequest("/hero");
        return json({ hero: hero });
    } catch (error) {
        const err = await IsError(error);
        console.log(err);
        if (err) {
            switch (err) {
                case "notFound":
                    return json({ hero: null });
            }
        }
        return json({ hero: null });
    }
};
export default function Index() {
    const { hero } = useLoaderData() as HeroType;

    return <>{hero && <Hero hero={hero} />}</>;
}
