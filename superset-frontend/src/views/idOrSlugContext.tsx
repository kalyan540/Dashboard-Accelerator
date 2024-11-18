import React, { createContext, useState, ReactNode, useContext } from 'react';
import { ContextMenuFilters } from '@superset-ui/core';

// Define the structure of a bioreactor data object
interface BioreactorData {
    id: number;
    plant_name: string;
    time: number;
    device_name: string;
    bioreactor_ph: number;
    bioreactor_dissolved_oxygen: number;
    bioreactor_temperature: number;
    bioreactor_agitation_speed: number;
    bioreactor_cell_density: number;
    bioreactor_viability: number;
    bioreactor_nutrient_concentration: number;
    bioreactor_metabolite_concentration: number;
    bioreactor_foam_control: number;
    bioreactor_pressure: number;
    bioreactor_conductivity: number;
    bioreactor_humidity: number;
    bioreactor_flow_rate_oxygen: number;
}

interface ContextType {
    idState: string[];
    Data: BioreactorData[];
    Biofilters?: ContextMenuFilters;
    embedchart: string[];
    updateidOrSlug: (ID: string) => void;
    removeLastIdOrSlug: () => void; // Add method to remove the last ID
    updateBioreactorData: (data: BioreactorData[]) => void;
    clearBioreactorData: () => void;
    setBiofiltersData: (biodata:ContextMenuFilters) => void;
    setBOTIframe: (string: string)  => void;
    clearBOTIframe: () => void;
}


// Create the context
const IDContext = createContext<ContextType | undefined>(undefined);

const IDProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [idState, setIdState] = useState<string[]>([]);
    const [Data, setData] = useState<BioreactorData[]>([]);
    const [Biofilters, setBiofilters] = useState<ContextMenuFilters>();
    const [embedchart, setembedchart] = useState<string[]>([]);
    console.log(idState);
    const updateidOrSlug = (ID: string) => {
        console.log(ID);
        setIdState(prevState => [...prevState, ID]);
    };

    const updateBioreactorData = (data: BioreactorData[]) => {
        console.log(data);
        setData(data);
    };
    const clearBioreactorData = () => {
        setData([]);  // Clear the data
    };
    const clearBOTIframe = () => {
        setembedchart([]);  // Clear the data
    };
    const setBiofiltersData = (biodata: ContextMenuFilters) => {
        console.log(biodata);
        setBiofilters(biodata);
    }

    const removeLastIdOrSlug = () => {
        setIdState(prevState => prevState.slice(0, -1)); // Remove the last element
    };

    const setBOTIframe = (string: string) => {
        console.log("Input string:", string); // Log the input string

        // Split the input string into URLs and trim each one
        const urls = string.split(";").map(url => url.trim());

        // Filter out duplicate URLs already present in embedchart
        const uniqueUrls = urls.filter(url => !embedchart.includes(url));

        if (uniqueUrls.length > 0) {
            // Update the state with the unique URLs
            setembedchart(prev => [...prev, ...uniqueUrls]);
            console.log("Added URLs:", uniqueUrls);
        } else {
            console.log("No new URLs to add.");
        }
    };

    return (
        <IDContext.Provider value={{ idState,Biofilters, Data,embedchart, setBOTIframe,clearBOTIframe, setBiofiltersData, updateidOrSlug, removeLastIdOrSlug, updateBioreactorData, clearBioreactorData }}>
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
