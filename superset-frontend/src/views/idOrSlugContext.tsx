import React, { createContext, useState, ReactNode } from 'react';

interface ContextType {
    idState: string;
    updateidOrSlug: (ID: string) => void;
}

// Create the context
const IDContext = createContext<ContextType | undefined>(undefined);

// Create a context
//const IDContext = createContext();

export const IDProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    //const [state, setState] = useState<{ user: User | null }>({ user: null });
    const [idState, setIdState] = useState<string>('');

    const updateidOrSlug = (ID: string) => {
        setIdState(ID);
    };

    return (
        <IDContext.Provider value={{ idState, updateidOrSlug }}>
            {children}
        </IDContext.Provider>
    );
};

export default IDContext;
