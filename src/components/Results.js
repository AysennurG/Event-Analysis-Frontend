import React from "react";
import "./Results.css";

function Results({ results }) {
  if (!results || results.length === 0) {
    return <p>No results available.</p>;
  }

  return (
    <div className="results">
      <h3>Detaylı Sonuçlar</h3>
      <table className="results-table">
        <thead>
          <tr>
            <th>Resim</th>
            <th>Yaş</th>
            <th>Cinsiyet</th>
            <th>Irk</th>
            <th>Duygu</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, idx) => (
            <tr key={idx}>
              <td>{result.image}</td>
              <td>{result.age}</td>
              <td>
                {result.gender === "Man" ? "👨" : result.gender === "Woman" ? "👩" : "❓"} {result.gender}
              </td>
              <td>{result.race}</td>
              <td>
                {result.emotion === "happy" && "😊"}
                {result.emotion === "sad" && "😢"}
                {result.emotion === "neutral" && "😐"}
                {result.emotion === "surprise" && "😲"}
                {result.emotion === "fear" && "😱"}
                {result.emotion === "angry" && "😠"}
                {result.emotion === "disgust" && "🤢"}
                {result.emotion && result.emotion.charAt(0).toUpperCase() + result.emotion.slice(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Results;