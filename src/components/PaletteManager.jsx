import React from 'react';

export default function PaletteManager({
  palette,
  numColors,
  setNumColors,
  shape,
  setShape,
  transparentBackground,
  setTransparentBackground,
  remixPalette,
  exportArtwork,
  loading,
  handleDragStart,
  handleDragOver,
  handleDrop,
}) {
  return (
    <div>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Number of Colors:</label>
        <input
          type="range"
          min="2"
          max="10"
          value={numColors}
          onChange={(e) => setNumColors(Number(e.target.value))}
          className="cursor-pointer"
        />
        <span className="ml-2">{numColors}</span>
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Select Artwork Shape:</label>
        <select
          value={shape}
          onChange={(e) => setShape(e.target.value)}
          className="cursor-pointer p-2 border rounded"
        >
          <option value="square">Square</option>
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
        </select>
      </div>
      <div className="mb-4 flex items-center space-x-4">
        <label className="flex items-center space-x-2 font-medium">
          <input
            type="checkbox"
            checked={transparentBackground}
            onChange={(e) => setTransparentBackground(e.target.checked)}
            className="cursor-pointer"
          />
          <span>Transparent Background</span>
        </label>
        <button
          onClick={remixPalette}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer disabled:opacity-50"
        >
          Remix Blocks
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2 mb-4">
        {palette.map((block, index) => (
          <div
            key={index}
            className="p-4 text-white font-bold cursor-pointer border rounded"
            style={{ backgroundColor: block.color }}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
          >
            {block.color} - {block.percentage}%
          </div>
        ))}
      </div>
      <button
        onClick={exportArtwork}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer disabled:opacity-50"
      >
        Export Artwork
      </button>
    </div>
  );
}