import { FC, useEffect } from 'react';
import { useID } from 'src/views/idOrSlugContext';
import { QueryFormData, ContextMenuFilters, BinaryQueryObjectFilterClause } from '@superset-ui/core';
//import { getDrillPayload } from 'src/components/Chart/DrillDetail/utils';
//import { ResultsPage } from 'src/components/Chart/DrillDetail/types';
import { getDatasourceSamples } from 'src/components/Chart/chartAction';

type DrillDashboardProps = {
    filters?: ContextMenuFilters;
    formData?: QueryFormData;
};

const PAGE_SIZE = 1;

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
    const { idState, updateidOrSlug, updateBioreactorData } = useID();
    console.log(filters);
    console.log(formData);

    // `useEffect` for fetching data when `datasource` exists in `drillToDetail`
    useEffect(() => {
        const fetchSamples = async () => {
            const targetFilter = filters?.drillToDetail?.find(
                (item) => item.datasource
            );

            if (targetFilter) {
                const [datasourceId, datasourceType] = targetFilter.datasource!.split('__');
                const jsonPayload = { filters: [{ col: "device_name", op: "IN", val: targetFilter?.val }], extras: { where: "" } };

                try {
                    const result = await getDatasourceSamples(
                        datasourceType,
                        datasourceId,
                        false,
                        jsonPayload,
                        PAGE_SIZE,
                        1
                    );
                    console.log(result);
                    console.log(result.data);
                    if (result?.data) {
                        updateBioreactorData(result.result.data[0]);  // Store data array in context
                    }
                } catch (error) {
                    console.error("Error fetching datasource samples:", error);
                }
            }
        };

        if (filters?.drillToDetail) fetchSamples();
    }, [filters?.drillToDetail, updateBioreactorData]);

    if (filters?.drillToDetail && Array.isArray(filters.drillToDetail)) {
        filters.drillToDetail.forEach((filterItem: BinaryQueryObjectFilterClause) => {
            if (filterItem.val && typeof filterItem.val === 'string' && valToIdMapping[filterItem.val]) {
                // Update idOrSlug based on the mapped value
                if (idState[idState.length - 1] != valToIdMapping[filterItem.val]) {
                    updateidOrSlug(valToIdMapping[filterItem.val]);
                }

            }
            if (filterItem.datasource) {
                updateidOrSlug('true');
            }
        })
    };



    return null; // This prevents anything from rendering


};

export default DrillDashboard;