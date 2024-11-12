import React from "react";
import "./Bioreactor.css"; // You can add styles here
import bioreactorIcon from "./bioreactor.gif";
import Button from 'src/components/Button';
import { useID } from 'src/views/idOrSlugContext';
import { css, SupersetTheme } from '@superset-ui/core';


function Bioreactor() {
  // Bioreactor data
  const { removeLastIdOrSlug, Data, clearBioreactorData } = useID();
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

  const bioreactorData = {
    pHLevel: "6.8",
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
  };
  console.log(Data);

  return (
    <div className="bioreactor-container">
      <div css={headerStyles} className="header-with-actions">
        <div className="title-panel">Bioreactor Parameters</div>
        <div className="back-button">
          <Button onClick={() => { removeLastIdOrSlug(); clearBioreactorData(); }} aria-label="Back">Back</Button>
        </div>
      </div>

      <div className="info-wrapper">
        <div className="title-panel1">Bioreactor_1</div>
        <div className="left-properties">
          <div className="property">
            <p><strong>pH Level</strong></p>
            <span>{bioreactorData.pHLevel} <span className="unit">pH</span></span>
          </div>
          <div className="property">
            <p><strong>Dissolved Oxygen (DO)</strong></p>
            <span>{bioreactorData.dissolvedOxygen} <span className="unit">mg/L</span></span>
          </div>
          <div className="property">
            <p><strong>Temperature</strong></p>
            <span>{bioreactorData.temperature} <span className="unit">°C</span></span>
          </div>
          <div className="property">
            <p><strong>Cell Density</strong></p>
            <span>{bioreactorData.cellDensity} <span className="unit">cells/mL</span></span>
          </div>
          <div className="property">
            <p><strong>Viability</strong></p>
            <span>{bioreactorData.viability} <span className="unit">%</span></span>
          </div>
          <div className="property">
            <p><strong>Humidity</strong></p>
            <span>{bioreactorData.humidity} <span className="unit">%</span></span>
          </div>
        </div>

        <div>
          <img src={bioreactorIcon} alt="Bioreactor" className="bioreactor-image" />
        </div>

        <div className="right-properties">
          <div className="property">
            <p><strong>Agitation Speed</strong></p>
            <span>{bioreactorData.agitationSpeed} <span className="unit">rpm</span></span>
          </div>
          <div className="property">
            <p><strong>Foam Level</strong></p>
            <span>{bioreactorData.foamLevel} <span className="unit">%</span></span>
          </div>
          <div className="property">
            <p><strong>Pressure</strong></p>
            <span>{bioreactorData.pressure} <span className="unit">kPa</span></span>
          </div>
          <div className="property">
            <p><strong>Nutrient Concentration</strong></p>
            <span>{bioreactorData.nutrientConcentration} <span className="unit">g/L</span></span>
          </div>
          <div className="property">
            <p><strong>Conductivity</strong></p>
            <span>{bioreactorData.conductivity} <span className="unit">mS/cm</span></span>
          </div>
          <div className="property">
            <p><strong>Flow Rate Oxygen</strong></p>
            <span>{bioreactorData.flowRateOxygen} <span className="unit">L/min</span></span>
          </div>
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
