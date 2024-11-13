import { FC, useEffect, useCallback } from 'react';
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
    console.log(filters);
    console.log(formData);

    // Fetching function with stable reference
    const fetchSamples = useCallback(async () => {
        const targetFilter = filters?.drillToDetail?.find((item) => item.datasource);
        if (targetFilter) {
            const [datasourceId, datasourceType] = targetFilter.datasource.split('__');
            console.log(datasourceId);
            const jsonPayload = { filters: [{ col: "device_name", op: "IN", val: targetFilter?.val }], extras: { where: "" } };
            try {
                const result = await getDatasourceSamplesLastRow(
                    datasourceType,
                    27,
                    false,
                    PAGE_SIZE,
                    jsonPayload,
                );
                console.log(result.data);
                if (result?.data) {
                    clearBioreactorData();
                    updateBioreactorData([result.data[result.data.length - 1]]);
                }
            } catch (error) {
                console.error("Error fetching datasource samples:", error);
            }
        }
    }, [filters?.drillToDetail, clearBioreactorData, updateBioreactorData]);

    // Stable interval with cleanup
    useEffect(() => {
        const intervalId = setInterval(fetchSamples, 10000);
        fetchSamples(); // Initial call on mount

        return () => clearInterval(intervalId); // Clear interval on unmount
    }, [fetchSamples]);

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