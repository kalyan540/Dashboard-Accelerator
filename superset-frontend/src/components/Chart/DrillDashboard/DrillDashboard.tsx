import { FC, useEffect } from 'react';
import { useID } from 'src/views/idOrSlugContext';
import { QueryFormData, ContextMenuFilters, BinaryQueryObjectFilterClause } from '@superset-ui/core';


type DrillDashboardProps = {
    filters?: ContextMenuFilters;
    formData?: QueryFormData;
};

//const PAGE_SIZE = 10;

// Predefined mapping of 'val' values to IDs
const valToIdMapping: { [key: string]: string } = {
    "USA": '16',
    "IND": '13',
    "DEU": '15',
    "NLD": '18',
    "CHE": '17',
    // Add more mappings as needed
};

const DrillDashboard: FC<DrillDashboardProps> = ({ filters, formData }) => {
    const { idState, updateidOrSlug, setBiofiltersData } = useID();
    //const intervalRef = useRef<NodeJS.Timeout | null>(null);

    console.log("Filters: ", filters);
    console.log("Form Data: ", formData);

    // Fetching function with logging
    /*const fetchSamples = useCallback(async () => {
        console.log("Fetching samples...");  // Added log to verify interval trigger
        const targetFilter = filters?.drillToDetail?.find((item) => item.datasource);
        if (targetFilter) {
            try {
                const result = await getDatasourceSamplesLastRow(
                    "table", // Replace with the appropriate datasourceType if needed
                    27,
                    false,
                    PAGE_SIZE,
                    { filters: [{ col: "device_name", op: "IN", val: targetFilter?.val }], extras: { where: "" } } // Simplified payload for example
                );
                console.log("Fetched data:", result.data);  // Log the fetched data
                if (result?.data) {
                    clearBioreactorData();
                    updateBioreactorData([result.data[result.data.length - 1]]);
                }
            } catch (error) {
                console.error("Error fetching datasource samples:", error);
            }
        }
    }, [filters, clearBioreactorData, updateBioreactorData]);

    // Set up interval to call fetchSamples every 10 seconds
    useEffect(() => {
        console.log("Setting up interval...");  
        const interval = setInterval(()=>{
            console.log("10Sec_Loop");
            fetchSamples();
        }, 10000);

        // Clean up interval on unmount
        return () => clearInterval(interval);
    }, [fetchSamples]); */

    // Updating ID based on filter values
    useEffect(() => {
        if (filters?.drillToDetail && Array.isArray(filters.drillToDetail)) {
            filters.drillToDetail.forEach((filterItem: BinaryQueryObjectFilterClause) => {
                if (filterItem.val && typeof filterItem.val === 'string' && valToIdMapping[filterItem.val]) {
                    if (idState[idState.length - 1] !== valToIdMapping[filterItem.val]) {
                        updateidOrSlug(valToIdMapping[filterItem.val]);
                    }
                }
                if (filterItem.datasource) {
                    updateidOrSlug('true');
                    setBiofiltersData(filters);

                }
            });
        }
    }, [filters, idState, updateidOrSlug]);

    return null; // This prevents anything from rendering
};

export default DrillDashboard;
