import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { commitSession, getSession } from "~/utils/session.server";
export const loader = async ({ request }: LoaderFunctionArgs) => {
    const session = await getSession(request.headers.get("Cookie"));

    session.unset("auth");
    return redirect("/", { headers: { "Set-Cookie": await commitSession(session) } });
};
function Logout() {
    return <div>Redirect...</div>;
}

export default Logout;
