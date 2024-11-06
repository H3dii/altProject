import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, useFetcher, useNavigate, useSearchParams } from "@remix-run/react";
import { validate } from "~/utils/validate";
import { useEffect, useState } from "react";
import Spinner from "~/components/Spinner";
import { IsError, PostRequest } from "~/utils/api";
import { toast } from "react-toastify";
import { commitSession, getSession } from "~/utils/session.server";
export const loader = async ({ request }: LoaderFunctionArgs) => {
    const session = await getSession(request.headers.get("Cookie"));
    if (session.has("auth")) {
        return redirect("/");
    }
    return null;
};
type LoginFetcherData = {
    errors?: { [key: string]: string };
    error?: string;
    success?: boolean;
    login?: boolean;
    user?: {
        id: number;
        username: string;
        global_name: string | null;
        email: string;
        avatar: any;
    };
};

const customMessages = {
    required: "Mező kitöltése kötelező.",
    email: "Érvénytelen e-mail cím.",
    minLength: `A mezőnek minimum {minLength} karakter hosszúnak kell lennie.`,
};

function Login() {
    const [searchParams] = useSearchParams();
    const navigte = useNavigate();
    const LoginFetcher = useFetcher<LoginFetcherData>();
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [serverError, setServerError] = useState<string | null>(null);
    useEffect(() => {
        if (searchParams.has("confirmed")) {
            toast.info("Email Cím sikeresen megerősítve. Most Már bejelentkezhetsz.");
            navigte("/login");
        }
    }, []);
    const handleValidation = (e: React.ChangeEvent<HTMLInputElement>, settings: any) => {
        const error = validate(e.target.value, settings, customMessages);
        setErrors((prevErrors) => ({
            ...prevErrors,
            [e.target.name]: error || "",
        }));
    };

    useEffect(() => {
        if (LoginFetcher.data) {
            if (LoginFetcher.data.login) {
                toast.success(`Sikeres bejelentkezés! Szia ${LoginFetcher.data.user?.global_name ? LoginFetcher.data.user?.global_name : LoginFetcher.data.user?.username}!`);
                return navigte("/");
            }
            setServerError(LoginFetcher.data.error || null);
            setErrors(LoginFetcher.data.errors || {});
        }
    }, [LoginFetcher.data]);

    return (
        <div className="flex p-4 items-center justify-center w-full h-full">
            <LoginFetcher.Form autoComplete="off" method="post" className="max-w-[30rem] w-full p-4 bg-neutral-900/80 backdrop-blur rounded-md gap-4 flex flex-col shadow-md drop-shadow-md">
                <h1 className="text-2xl font-semibold text-center mb-2 border-b-2 border-sky-500 pb-2">Bejelentkezés</h1>

                <label className="flex flex-col gap-1">
                    <p className="text-sm font-medium">
                        Email cím / Felhasználónév <span className="text-rose-500">*</span>
                    </p>
                    <input onChange={(e) => handleValidation(e, { required: true })} type="text" name="idetified" placeholder="Email cím / Felhasználónév" className={`${errors.email ? "border-rose-500" : "border-transparent"} duration-200 border p-2 text-[1rem] font-medium rounded-md w-full bg-neutral-800/60 shadow-md drop-shadow-md`} />
                    {errors.idetified && <span className="text-rose-500">{errors.idetified}</span>}
                </label>
                <label className="flex flex-col gap-1">
                    <p className="text-sm font-medium">
                        Jelszó <span className="text-rose-500">*</span>
                    </p>
                    <input onChange={(e) => handleValidation(e, { required: true })} type="password" name="password" placeholder="Jelszó" className={`${errors.password ? "border-rose-500" : "border-transparent"} duration-200 border p-2 text-[1rem] font-medium rounded-md w-full bg-neutral-800/60 shadow-md drop-shadow-md`} />
                    {errors.password && <span className="text-rose-500">{errors.password}</span>}
                </label>
                {serverError && <div className="text-rose-500">{serverError}</div>}
                <button className={`${LoginFetcher.state === "submitting" ? "bg-sky-700/60" : "bg-sky-600/60 hover:bg-sky-700/60"}  w-full p-1.5 duration-200 text-white font-medium rounded-md text-lg shadow-md drop-shadow-md flex items-center justify-center h-[2.5rem]`}>{LoginFetcher.state === "submitting" ? <Spinner size="2rem" /> : "Bejelentezés"}</button>
                <span className="text-white/90 font-medium w-max">
                    Nincs még fiókod?{" "}
                    <Link to="/register" className="text-sky-600 hover:underline cursor-pointer">
                        Regisztráció
                    </Link>
                </span>
            </LoginFetcher.Form>
        </div>
    );
}

export default Login;

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const data = await request.formData();
    const { idetified, password } = Object.fromEntries(data) as Record<string, string>;

    // Use different settings for validation
    const idetifiedSettings = { required: true };
    const passwordSettings = { required: true };

    const errors: Record<string, string | undefined> = {
        idetified: validate(idetified, idetifiedSettings, customMessages),
        password: validate(password, passwordSettings, customMessages),
    };

    if (errors.idetified || errors.password) {
        return { errors };
    }

    try {
        const { data: LoginData } = await PostRequest("/auth/login", { idetified, password });
        console.log(LoginData);
        const session = await getSession(request.headers.get("Cookie"));
        session.set("auth", LoginData.jwt);
        return json({ login: true, user: LoginData.user }, { headers: { "Set-Cookie": await commitSession(session) } });
    } catch (error) {
        const err = await IsError(error);
        console.log(err);
        if (err) {
            if (err.idetified) {
                switch (err.idetified) {
                    case "RequiredError":
                        return { error: "Tölts ki minden mezőt" };
                }
            }
            if (err.password) {
                switch (err.password) {
                    case "RequiredError":
                        return { error: "Tölts ki minden mezőt" };
                }
            }
            switch (err) {
                case "wrongLoginData":
                    return { error: "Hibás belépési adatok" };
            }
        }
        return { error: "Váratlan hiba történt" };
    }
};
