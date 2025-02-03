import React from 'react';

export default function ImageProcessor({ fileInputRef, handleFileChange, imageSrc, loading }) {
  return (
    <div>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Upload Photo:</label>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="box-border p-2 border rounded cursor-pointer"
        />
      </div>
      {loading && (
        <div className="mb-4">
          <p className="text-blue-600">Processing...</p>
        </div>
      )}
      {imageSrc && (
        <div className="mb-4">
          <img src={imageSrc} alt="Uploaded" className="max-w-full mb-4" />
        </div>
      )}
    </div>
  );
}