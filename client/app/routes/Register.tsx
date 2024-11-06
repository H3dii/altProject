import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, useFetcher } from "@remix-run/react";
import { validate } from "~/utils/validate";
import { useEffect, useState } from "react";
import Spinner from "~/components/Spinner";
import { IsError, PostRequest } from "~/utils/api";
import { getSession } from "~/utils/session.server";
export const loader = async ({ request }: LoaderFunctionArgs) => {
    const session = await getSession(request.headers.get("Cookie"));
    if (session.has("auth")) {
        return redirect("/");
    }
    return null;
};
type RegisterFetcherData = {
    errors?: { [key: string]: string };
    error?: string;
    success?: boolean;
};

const customMessages = {
    required: "Mező kitöltése kötelező.",
    email: "Érvénytelen e-mail cím.",
    minLength: `A mezőnek minimum {minLength} karakter hosszúnak kell lennie.`,
};

function Register() {
    const RegisterFetcher = useFetcher<RegisterFetcherData>();
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [succesRegister, setSuccesRegister] = useState(false);
    const handleValidation = (e: React.ChangeEvent<HTMLInputElement>, settings: any) => {
        const error = validate(e.target.value, settings, customMessages);
        setErrors((prevErrors) => ({
            ...prevErrors,
            [e.target.name]: error || "",
        }));
    };

    useEffect(() => {
        if (RegisterFetcher.data) {
            if (RegisterFetcher.data.success) {
                return setSuccesRegister(true);
            }
            setServerError(RegisterFetcher.data.error || null);
            setErrors(RegisterFetcher.data.errors || {});
        }
    }, [RegisterFetcher.data]);

    if (succesRegister) {
        return (
            <div className="flex p-4 items-center justify-center w-full h-full">
                <div className="max-w-[38rem] w-full flex flex-col p-4 gap-4 bg-neutral-900 drop-shadow-md shadow-md rounded-md">
                    <h1 className="text-2xl font-medium text-center">Sikeres regisztráció!</h1>
                    <p className="text-center text-xl font-medium">A regisztráció sikeres volt! Az Ön által regisztrált email-re elküldtük a megerősítő hivatkozást. Ezen hivatkozás segítségével meg kell erősítenie regisztrávióját, majd ezt követően bejelentkezhet.</p>
                </div>
            </div>
        );
    }
    return (
        <div className="flex p-4 items-center justify-center w-full h-full">
            <RegisterFetcher.Form autoComplete="off" method="post" className="max-w-[30rem] w-full p-4 bg-neutral-900/80 backdrop-blur rounded-md gap-4 flex flex-col shadow-md drop-shadow-md">
                <h1 className="text-2xl font-semibold text-center mb-2 border-b-2 border-sky-500 pb-2">Fiók Létrehozás</h1>

                <label className="flex flex-col gap-1">
                    <p className="text-sm font-medium">
                        Email <span className="text-rose-500">*</span>
                    </p>
                    <input onChange={(e) => handleValidation(e, { required: true, email: true })} type="text" name="email" placeholder="Email" className={`${errors.email ? "border-rose-500" : "border-transparent"} duration-200 border p-2 text-[1rem] font-medium rounded-md w-full bg-neutral-800/60 shadow-md drop-shadow-md`} />
                    {errors.email && <span className="text-rose-500">{errors.email}</span>}
                </label>
                <label className="flex flex-col gap-1">
                    <p className="text-sm font-medium">
                        Felhasználónév <span className="text-rose-500">*</span>
                    </p>
                    <input onChange={(e) => handleValidation(e, { minLength: 3, required: true })} type="text" name="username" placeholder="Felhasználónév" className={`${errors.username ? "border-rose-500" : "border-transparent"} duration-200 border p-2 text-[1rem] font-medium rounded-md w-full bg-neutral-800/60 shadow-md drop-shadow-md`} />
                    {errors.username && <span className="text-rose-500">{errors.username}</span>}
                </label>
                <label className="flex flex-col gap-1">
                    <p className="text-sm font-medium">
                        Jelszó <span className="text-rose-500">*</span>
                    </p>
                    <input onChange={(e) => handleValidation(e, { minLength: 8, required: true })} type="password" name="password" placeholder="Jelszó" className={`${errors.password ? "border-rose-500" : "border-transparent"} duration-200 border p-2 text-[1rem] font-medium rounded-md w-full bg-neutral-800/60 shadow-md drop-shadow-md`} />
                    {errors.password && <span className="text-rose-500">{errors.password}</span>}
                </label>
                {serverError && <div className="text-rose-500">{serverError}</div>}
                <button className={`${RegisterFetcher.state === "submitting" ? "bg-sky-700/60" : "bg-sky-600/60 hover:bg-sky-700/60"}  w-full p-1.5 duration-200 text-white font-medium rounded-md text-lg shadow-md drop-shadow-md flex items-center justify-center h-[2.5rem]`}>{RegisterFetcher.state === "submitting" ? <Spinner size="2rem" /> : "Tovább"}</button>
                <span className="text-white/90 font-medium w-max">
                    Van már felhasználód?{" "}
                    <Link to="/login" className="text-sky-600 hover:underline cursor-pointer">
                        Bejelentkezés
                    </Link>
                </span>
            </RegisterFetcher.Form>
        </div>
    );
}

export default Register;

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const data = await request.formData();
    const { email, username, password } = Object.fromEntries(data) as Record<string, string>;

    const emailSettings = { required: true, email: true };
    const usernameSettings = { required: true, minLength: 3 };
    const passwordSettings = { required: true, minLength: 8 };

    const errors: Record<string, string | undefined> = {
        email: validate(email, emailSettings, customMessages),
        username: validate(username, usernameSettings, customMessages),
        password: validate(password, passwordSettings, customMessages),
    };

    if (errors.email || errors.username || errors.password) {
        return { errors };
    }

    try {
        const { data: registerData } = await PostRequest("/auth/register", { email, username, password });
        console.log(registerData);
        return { success: "ok" };
    } catch (error) {
        const err = await IsError(error);
        console.log(err);
        if (err) {
            if (err.email) {
                switch (err.email) {
                    case "EmailError":
                        return { error: "Valós email címet adj meg," };
                    case "RequiredError":
                        return { error: "Az email cím megadása kötelező." };
                    case "Taken":
                        return { error: "Az email cím már használatban van." };
                }
            }
            if (err.username) {
                switch (err.username) {
                    case "RequiredError":
                        return { error: "A felhasználó név megadása kötelező." };
                    case "MinLenghtError":
                        return { error: "A felhasználóv minimum 3 karakter hosszunken kell lennie." };
                    case "Taken":
                        return { error: "Az felhasználóv már használatban van." };
                }
            }
            if (err.password) {
                switch (err.password) {
                    case "RequiredError":
                        return { error: "A jelszó név megadása kötelező." };
                    case "MinLenghtError":
                        return { error: "A jelszónak minimum 8 karakter hosszunken kell lennie." };
                }
            }
            return { error: "Váratlan hiba történt." };
        }
        return { error: "Váratlan hiba történt." };
    }
};
