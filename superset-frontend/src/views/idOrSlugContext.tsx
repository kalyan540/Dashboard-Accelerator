import React, { createContext, useState, ReactNode, useContext } from 'react';

interface ContextType {
    idState: string[];
    Data: object[];
    updateidOrSlug: (ID: string) => void;
    removeLastIdOrSlug: () => void; // Add method to remove the last ID
    updateBioreactorData: (data: object[]) => void;
    clearBioreactorData: () => void;
}

// Create the context
const IDContext = createContext<ContextType | undefined>(undefined);

const IDProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [idState, setIdState] = useState<string[]>([]);
    const [Data, setData] = useState<object[]>([]);
    console.log(idState);
    const updateidOrSlug = (ID: string) => {
        console.log(ID);
        setIdState(prevState => [...prevState, ID]);
    };

    const updateBioreactorData = (data: object[]) => {
        console.log(data);
        setData(data);
    };
    const clearBioreactorData = () => {
        setData([]);  // Clear the data
    };

    const removeLastIdOrSlug = () => {
        setIdState(prevState => prevState.slice(0, -1)); // Remove the last element
    };

    return (
        <IDContext.Provider value={{ idState, Data, updateidOrSlug, removeLastIdOrSlug, updateBioreactorData, clearBioreactorData }}>
            {children}
        </IDContext.Provider>
    );
};

const useID = () => {
    const context = useContext(IDContext);
    if (!context) {
        throw new Error("useID must be used within an IDProvider");
    }
    return context;
};

export { IDProvider, useID };
