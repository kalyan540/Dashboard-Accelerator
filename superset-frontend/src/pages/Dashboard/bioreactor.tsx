import React, { useEffect, useState } from "react";
import "./Bioreactor.css"; // You can add styles here
import bioreactorIcon from "./bioreactor.gif";
import Button from 'src/components/Button';
import { useID } from 'src/views/idOrSlugContext';
import { css, SupersetTheme } from '@superset-ui/core';
import { getDatasourceSamplesLastRow } from 'src/components/Chart/chartAction';

// Define types for the PropertyDisplay component
interface Indicator {
  color: string;  // Color property for the indicator
}

interface PropertyDisplayProps {
  label: string;
  value: string | number;
  unit: string;
  indicator: Indicator;
}

const PropertyDisplay: React.FC<PropertyDisplayProps> = ({ label, value, unit, indicator }) => (
  <div className="property">
    <p>{label}</p>
    <div className="property-value-box">
      {/* Indicator (colored circle based on status) */}
      <span className="indicator" style={{ backgroundColor: indicator.color }} />

      {/* Value and Unit */}
      <span className="property-value">{value}</span>
      <span className="unit">{unit}</span>
    </div>
  </div>
);

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

function Bioreactor() {
  // Bioreactor data
  const { removeLastIdOrSlug, Biofilters } = useID();
  const headerStyles = (theme: SupersetTheme) => css`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: nowrap;
  justify-content: space-between;
  background-color: ${theme.colors.grayscale.light5};
  height: ${theme.gridUnit * 16}px;
  padding: 0 ${theme.gridUnit * 4}px;

  .editable-title {
    overflow: hidden;

    & > input[type='button'],
    & > span {
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      white-space: nowrap;
    }
  }

  span[role='button'] {
    display: flex;
    height: 100%;
  }

  .title-panel {
    display: flex;
    align-items: center;
    min-width: 0;
    margin-right: ${theme.gridUnit * 12}px;
    font-size: 21px;
    font-weight: 600;
  }

  .right-button-panel {
    display: flex;
    align-items: center;
  }
`;

  /*const bioreactorData = {
    pHLevel: Data[0].bioreactor_ph,
    dissolvedOxygen: "5.0",
    temperature: "37",
    agitationSpeed: "150",
    foamLevel: "Moderate",
    pressure: "1",
    nutrientConcentration: "2",
    cellDensity: "45",
    viability: "87",
    conductivity: "6.7",
    humidity: "35",
    flowRateOxygen: "76"
  };*/
  // Fetching function with logging
  const [Data, setBioreactorData] = useState<BioreactorData[]>([]);
  const fetchSamples = async () => {
    console.log("Fetching samples...");  // Added log to verify interval trigger
    const targetFilter = Biofilters?.drillToDetail?.find((item) => item.datasource);
    if (targetFilter) {
      try {
        const result = await getDatasourceSamplesLastRow(
          "table", // Replace with the appropriate datasourceType if needed
          27,
          true,
          1,
          { filters: [{ col: "device_name", op: "IN", val: targetFilter?.val }], extras: { where: "" } } // Simplified payload for example
        );
        console.log("Fetched data:", result.data);  // Log the fetched data
        if (result?.data) {
          setBioreactorData([result.data[result.data.length - 1]]);
        }
      } catch (error) {
        console.error("Error fetching datasource samples:", error);
      }
    }
  };

  // Set up interval to call fetchSamples every 10 seconds
  useEffect(() => {
    console.log("Setting up interval...");
    fetchSamples();
    const interval = setInterval(() => {
      console.log("10Sec_Loop");
      fetchSamples();
    }, 5000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  const bioreactorData = {
    pHLevel: Data[0]?.bioreactor_ph ?? 'N/A',
    dissolvedOxygen: Data[0]?.bioreactor_dissolved_oxygen ?? 'N/A',
    temperature: Data[0]?.bioreactor_temperature ?? 'N/A',
    agitationSpeed: Data[0]?.bioreactor_agitation_speed ?? 'N/A',
    cellDensity: Data[0]?.bioreactor_cell_density ?? 'N/A',
    viability: Data[0]?.bioreactor_viability ?? 'N/A',
    nutrientConcentration: Data[0]?.bioreactor_nutrient_concentration ?? 'N/A',
    foamControl: Data[0]?.bioreactor_foam_control ?? 'N/A',
    pressure: Data[0]?.bioreactor_pressure ?? 'N/A',
    conductivity: Data[0]?.bioreactor_conductivity ?? 'N/A',
    humidity: Data[0]?.bioreactor_humidity ?? 'N/A',
    flowRateOxygen: Data[0]?.bioreactor_flow_rate_oxygen ?? 'N/A',
    device_name: Data[0]?.device_name ?? 'BioReactor'
  };
  console.log(Data);

  return (
    <div className="bioreactor-container">
      <div css={headerStyles} className="header-with-actions">
        <div className="title-panel">Bioreactor Parameters</div>
        <div className="back-button">
          <Button onClick={() => { removeLastIdOrSlug(); }} aria-label="Back">Back</Button>
        </div>
      </div>

      <div className="title-panel1">{bioreactorData.device_name}</div>
      <div className="info-wrapper">

        <div className="left-properties">
          <PropertyDisplay
            label="pH Level"
            value={bioreactorData.pHLevel}
            unit="pH"
            indicator={{ color: bioreactorData.pHLevel < 7 ? 'red' : 'green' }}
          />
          <PropertyDisplay
            label="Dissolved Oxygen (DO)"
            value={bioreactorData.dissolvedOxygen}
            unit="mg/L"
            indicator={{ color: bioreactorData.dissolvedOxygen > 3 ? 'green' : 'yellow' }}
          />
          <PropertyDisplay
            label="Temperature"
            value={bioreactorData.temperature}
            unit="°C"
            indicator={{ color: bioreactorData.temperature > 37 ? 'red' : 'green' }}
          />
          <PropertyDisplay
            label="Cell Density"
            value={bioreactorData.cellDensity}
            unit="cells/mL"
            indicator={{ color: 'green' }}
          />
          <PropertyDisplay
            label="Viability"
            value={bioreactorData.viability}
            unit="%"
            indicator={{ color: bioreactorData.viability > 80 ? 'green' : 'yellow' }}
          />
          <PropertyDisplay
            label="Humidity"
            value={bioreactorData.humidity}
            unit="%"
            indicator={{ color: bioreactorData.humidity > 30 ? 'green' : 'yellow' }}
          />
        </div>

        <div>
          <img src={bioreactorIcon} alt="Bioreactor" className="bioreactor-image" />
        </div>

        <div className="right-properties">
          <PropertyDisplay
            label="Agitation Speed"
            value={bioreactorData.agitationSpeed}
            unit="rpm"
            indicator={{ color: 'green' }}
          />
          <PropertyDisplay
            label="Foam Control"
            value={bioreactorData.foamControl}
            unit="%"
            indicator={{ color: 'yellow' }}
          />
          <PropertyDisplay
            label="Pressure"
            value={bioreactorData.pressure}
            unit="kPa"
            indicator={{ color: 'green' }}
          />
          <PropertyDisplay
            label="Nutrient Concentration"
            value={bioreactorData.nutrientConcentration}
            unit="g/L"
            indicator={{ color: 'green' }}
          />
          <PropertyDisplay
            label="Conductivity"
            value={bioreactorData.conductivity}
            unit="mS/cm"
            indicator={{ color: 'green' }}
          />
          <PropertyDisplay
            label="Flow Rate Oxygen"
            value={bioreactorData.flowRateOxygen}
            unit="L/min"
            indicator={{ color: 'green' }}
          />
        </div>
      </div>
    </div>
  );
}

export default Bioreactor;

/*<div className="header">
        <button className="back-button" onClick={removeLastIdOrSlug}>
          Back
        </button>
        <h1 className="title">Bioreactor Parameters</h1>
      </div> */
