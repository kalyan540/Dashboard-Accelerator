import { FC } from 'react';
import { useID } from 'src/views/idOrSlugContext';
import { ContextMenuFilters, BinaryQueryObjectFilterClause } from '@superset-ui/core';

type DrillDashboardProps = {
    filters?: ContextMenuFilters
};

// Predefined mapping of 'val' values to IDs
const valToIdMapping: { [key: string]: string } = {
    "USA": '16',
    "IND": '13',
    "DEU": '15',
    "NLD": '18',
    "CHE": '17',
    // Add more mappings as needed
};

const DrillDashboard: FC<DrillDashboardProps> = ({ filters }) => {
    const { idState, updateidOrSlug } = useID();
    console.log(filters);
    if (filters?.drillToDetail && Array.isArray(filters.drillToDetail)) {
        filters.drillToDetail.forEach((filterItem: BinaryQueryObjectFilterClause) => {
            if (filterItem.val && typeof filterItem.val === 'string' && valToIdMapping[filterItem.val]) {
                // Update idOrSlug based on the mapped value
                if (idState[idState.length - 1] != valToIdMapping[filterItem.val]) {
                    updateidOrSlug(valToIdMapping[filterItem.val]);
                }
                
            }
        });
    }

    return null; // This prevents anything from rendering


};

export default DrillDashboard;