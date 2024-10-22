import React from "react";
import "./Bioreactor.css"; // You can add styles here
import bioreactorIcon from "./bioreactor-icon.png";

function Bioreactor() {
  // Bioreactor data
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
      <h1 className="title">Bioreactor Parameters</h1>
      <div className="info-wrapper">
        <div>
          {" "}
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
        <div>
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
