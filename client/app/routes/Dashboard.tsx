import { Outlet } from "@remix-run/react";
import Sidebar from "~/components/Sidebar";

function Dashboard() {
    return (
        <>
            <section id="dashboard">
                <Sidebar />
                <div className="w-[calc(100%_-_16rem)] left-[16rem] relative h-full">
                    <Outlet />
                </div>
            </section>
        </>
    );
}

export default Dashboard;
