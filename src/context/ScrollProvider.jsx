import { createContext, useContext, useRef } from "react";

const ScrollContext = createContext();

export function ScrollProvider({ children }) {
    const bottomRef = useRef(null);

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <ScrollContext.Provider value={{ bottomRef, scrollToBottom }}>
            {children}
        </ScrollContext.Provider>
    )
}