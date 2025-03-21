import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ThemeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Load dark mode state from AsyncStorage
        const loadTheme = async () => {
            const savedTheme = await AsyncStorage.getItem("darkMode");
            if (savedTheme !== null) {
                setIsDarkMode(JSON.parse(savedTheme));
            }
        };
        loadTheme();
    }, []);

    const toggleDarkMode = async () => {
        setIsDarkMode((prev) => {
            const newTheme = !prev;
            AsyncStorage.setItem("darkMode", JSON.stringify(newTheme));
            return newTheme;
        });
    };
    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};