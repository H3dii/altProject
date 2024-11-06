import { Link, useLocation } from "@remix-run/react";
import Icon from "./Icons";

function Sidebar() {
    const location = useLocation();
    return (
        <aside className="fixed top-[4rem] left-0 h-[calc(100vh_-_4rem)] z-50 w-64 bg-neutral-900 flex flex-col justify-start items-start gap-2 p-2">
            <Link to={`/dashboard`} className={`${location.pathname === "/dashboard" && "text-sky-500"} flex items-center gap-1 p-2 hover:bg-neutral-800 duration-200 rounded-md w-full text-lg font-medium`}>
                <Icon name="MdDashboard" />
                <span>Dashboard</span>
            </Link>
            <Link to={`/dashboard/anime`} className={`${location.pathname.includes("/dashboard/anime") && "text-sky-500"} flex items-center gap-1 p-2 hover:bg-neutral-800 duration-200 rounded-md w-full text-lg font-medium`}>
                <Icon name="MdDataset" />
                <span>Anime</span>
            </Link>
        </aside>
    );
}

export default Sidebar;
