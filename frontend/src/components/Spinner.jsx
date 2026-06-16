import React from "react";
import "./Spinner.css";

const Spinner = ({ show }) => {
  if (!show) return null;

  return (
    <div className="spinner-overlay">
      <div className="fam-loader">
        <span className="fam-letter" style={{ "--i": 0 }}>F</span>
        <span className="fam-letter" style={{ "--i": 1 }}>A</span>
        <span className="fam-letter" style={{ "--i": 2 }}>M</span>
      </div>
      <div className="fam-tagline">Loading your health hub…</div>
    </div>
  );
};

export default Spinner;