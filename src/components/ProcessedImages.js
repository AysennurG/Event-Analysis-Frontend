import React from "react";
import "./ProcessedImages.css";

function ProcessedImages({ images }) {
  if (!images || images.length === 0) {
    return <p>No processed images available.</p>;
  }

  return (
    <div className="processed-images">
      <h3>Processed Images</h3>
      <div className="image-grid">
        {images.map((image, index) => (
          <div key={index} className="image-container">
            <img
              src={`http://127.0.0.1:5000/uploads/${image}`}
              alt={`Processed ${index}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProcessedImages;