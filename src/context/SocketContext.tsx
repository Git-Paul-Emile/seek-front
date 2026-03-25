import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { socketService } from "@/services/socketService";

interface SocketContextValue {
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ isConnected: false });

export function SocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketService.connect();
    const unsub = socketService.onConnected(setIsConnected);
    return unsub;
  }, []);

  return (
    <SocketContext.Provider value={{ isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketConnected(): boolean {
  return useContext(SocketContext).isConnected;
}
