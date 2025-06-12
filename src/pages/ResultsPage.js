import React from "react";
import Graphs from "../components/Graphs";

function ResultsPage({ pageData }) {
  if (!pageData) {
    // Yükleniyor veya veri yoksa boş dön
    return <div>Yükleniyor...</div>;
  }

  let results = [];
  let report = null;

  if (pageData?.event_details) {
    results = pageData.event_details.results || [];
    report = pageData.event_details.report || null;
  } else {
    results = pageData.analysis_results || pageData.results || [];
    report = pageData.report || null;
  }

  return (
    <div className="results-page">
      <h2>Analysis Results</h2>
      <Graphs report={report} results={results} />
    </div>
  );
}

export default ResultsPage;