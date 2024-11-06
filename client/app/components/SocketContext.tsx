import React, { createContext, useContext } from "react";
import { io, Socket } from "socket.io-client";
import config from "~/utils/config";

const SocketContext = createContext<Socket | undefined>(undefined);

export let socket: Socket | undefined;

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (config.WEBSOCKET && !socket) {
        socket = io(config.WEBSOCKET, { transports: ["websocket"] });

        const handleDisconnect = () => {
            setTimeout(() => socket?.connect(), 5000);
        };

        socket.on("disconnect", handleDisconnect);
    }

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = (): Socket | undefined => {
    const context = useContext(SocketContext);
    if (context === undefined && config.WEBSOCKET) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};
