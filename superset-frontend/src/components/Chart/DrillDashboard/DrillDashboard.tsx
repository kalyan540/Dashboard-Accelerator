import { FC, useEffect, useRef } from 'react';
import { useID } from 'src/views/idOrSlugContext';
import { QueryFormData, ContextMenuFilters, BinaryQueryObjectFilterClause } from '@superset-ui/core';
//import { getDrillPayload } from 'src/components/Chart/DrillDetail/utils';
//import { ResultsPage } from 'src/components/Chart/DrillDetail/types';
import { getDatasourceSamplesLastRow } from 'src/components/Chart/chartAction';

type DrillDashboardProps = {
    filters?: ContextMenuFilters;
    formData?: QueryFormData;
};

const PAGE_SIZE = 10;

// Predefined mapping of 'val' values to IDs
const valToIdMapping: { [key: string]: string } = {
    "USA": '16',
    "IND": '13',
    "DEU": '15',
    "NLD": '18',
    "CHE": '17',
    // Add more mappings as needed
};

// Predefined mapping of 'val' values to IDs
/*const valToBioReactorMapping: { [key: string]: string } = {
    "BioReactor": '16'
};*/

const DrillDashboard: FC<DrillDashboardProps> = ({ filters, formData }) => {
    const { idState, updateidOrSlug, updateBioreactorData, clearBioreactorData } = useID();
    const intervalRef = useRef<number | null>(null);
    console.log(filters);
    console.log(formData);

    const fetchSamples = async () => {
        try {
            const result = await getDatasourceSamplesLastRow(
                "table", // Replace with the appropriate datasourceType if needed
                27,
                false,
                PAGE_SIZE,
                { filters: [], extras: { where: "" } } // Simplified payload for example
            );
            console.log(result.data);
            if (result?.data) {
                clearBioreactorData();
                updateBioreactorData([result.data[result.data.length - 1]]);
            }
        } catch (error) {
            console.error("Error fetching datasource samples:", error);
        }
    };

     // Run fetchSamples every 10 seconds
     useEffect(() => {
        fetchSamples(); // Initial fetch on mount

        // Set up interval
        intervalRef.current = setInterval(fetchSamples, 10000);

        // Clean up interval on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []); // Empty dependency array ensures this runs only once on mount

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
                }
            });
        }
    }, [filters, idState, updateidOrSlug]);



    return null; // This prevents anything from rendering


};

export default DrillDashboard;