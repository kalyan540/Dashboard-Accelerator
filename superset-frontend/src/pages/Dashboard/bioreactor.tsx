import React from "react";
import "./Bioreactor.css"; // You can add styles here
import bioreactorIcon from "./bioreactor.gif";
import Button from 'src/components/Button';
import { useID } from 'src/views/idOrSlugContext';
import { css, SupersetTheme } from '@superset-ui/core';

function Bioreactor() {
  // Bioreactor data
  const { removeLastIdOrSlug } = useID();
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
    dissolvedOxygen: "5.0 mg/L",
    temperature: "37°C",
    agitationSpeed: "150 RPM",
    foamLevel: "Moderate",
    pressure: "1 atm",
    nutrientConcentration: "2 g/L glucose",
  };

  return (
    <div className="bioreactor-container">
      <div css={headerStyles} className="header-with-actions">
        <div className="title-panel">
          Bioreactor Parameters
        </div>

        <div className="back-button">
          <Button
            onClick={removeLastIdOrSlug} // Define this function to handle the back action
            aria-label="Back"
          >
            Back
          </Button>
        </div>

      </div>
      <div className="info-wrapper">
        <div className="left-properties">
          <div className="property">
            <p><strong>pH Level</strong></p> {bioreactorData.pHLevel}
          </div>
          <div className="property">
            <p><strong>Dissolved Oxygen (DO)</strong></p> {bioreactorData.dissolvedOxygen}
          </div>
          <div className="property">
            <p><strong>Temperature</strong></p> {bioreactorData.temperature}
          </div>
        </div>
        <div>
          <img
            src={bioreactorIcon}
            alt="Bioreactor"
            className="bioreactor-image"
          />
        </div>
        <div className="right-properties">
          <div className="property">
            <p><strong>Agitation Speed</strong></p> {bioreactorData.agitationSpeed}
          </div>
          <div className="property">
            <p><strong>Foam Level</strong></p> {bioreactorData.foamLevel}
          </div>
          <div className="property">
            <p><strong>Pressure</strong></p> {bioreactorData.pressure}
          </div>
          <div className="property">
            <p><strong>Nutrient Concentration</strong></p> {bioreactorData.nutrientConcentration}
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
