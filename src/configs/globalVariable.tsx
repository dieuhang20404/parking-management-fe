import { createContext, useEffect, useState, type Dispatch, type JSX, type ReactNode, type SetStateAction } from "react";
import { messageService } from "./interface";
import { reloadPageApi } from "../services/appService";

interface UserContextType {
    isAuthenticated: boolean,
    setIsAuthenticated: Dispatch<SetStateAction<boolean>>,
    isLoading: boolean,
    setIsLoading: Dispatch<SetStateAction<boolean>>
}

export const UserContext = createContext<UserContextType>({
    isAuthenticated: false,
    setIsAuthenticated: () => {},
    isLoading: false,
    setIsLoading: () => {}
})

interface UserProviderProps {
    children: ReactNode
}

export const UserProvider = ({children}: UserProviderProps): JSX.Element => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    useEffect(() => {
        reloadPage();
    }, [])

    const reloadPage = async (): Promise<void> => {
        setIsLoading(true);
        try {
            console.log("reload")
            const result = await reloadPageApi();
            if (result.code == 0) {
                setIsAuthenticated(true);
            } else if (result.code == 2) {
                console.log(result.data)
                localStorage.setItem("key", result.data);
                setIsAuthenticated(false);
            } else {
                setIsAuthenticated(false);
            }
        } catch(e) {
            console.log(e);
            messageService.error("Xảy ra lỗi ở server")
        } finally {
            setIsLoading(false);
        }
    }

    return(
        <UserContext.Provider
            value={{
                isAuthenticated: isAuthenticated,
                setIsAuthenticated: setIsAuthenticated,
                isLoading: isLoading,
                setIsLoading: setIsLoading
            }}
        >
            {children}
        </UserContext.Provider>
    )
} 