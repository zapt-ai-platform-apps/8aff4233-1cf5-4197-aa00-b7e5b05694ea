import React, { useState, useRef } from 'react';
import { extractColors } from './colorUtils';
import * as Sentry from '@sentry/browser';

export default function App() {
  const [imageSrc, setImageSrc] = useState(null);
  const [palette, setPalette] = useState([]);
  const [numColors, setNumColors] = useState(5);
  const [shape, setShape] = useState('square');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const dragItemIndex = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        setImageSrc(event.target.result);
        const img = new Image();
        img.onload = async () => {
          console.log('Image loaded, processing colors...');
          try {
            const colors = await extractColors(img, numColors);
            setPalette(colors);
            console.log('Extracted palette:', colors);
          } catch (error) {
            console.error('Error extracting colors:', error);
            Sentry.captureException(error);
          }
          setLoading(false);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
      Sentry.captureException(error);
      setLoading(false);
    }
  };

  const handleDragStart = (e, index) => {
    dragItemIndex.current = index;
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    const draggedIndex = dragItemIndex.current;
    if (draggedIndex === null || draggedIndex === index) return;
    const newPalette = [...palette];
    const draggedItem = newPalette[draggedIndex];
    newPalette.splice(draggedIndex, 1);
    newPalette.splice(index, 0, draggedItem);
    setPalette(newPalette);
  };

  const exportArtwork = () => {
    if (!palette.length) return;
    setLoading(true);
    try {
      const canvas = document.createElement('canvas');
      const blockWidth = 100;
      const blockHeight = 100;
      let canvasWidth = blockWidth;
      let canvasHeight = blockHeight * palette.length;
      if (shape === 'rectangle') {
        canvasWidth = 200;
        canvasHeight = (blockHeight * palette.length) / 2;
      } else if (shape === 'circle') {
        canvasWidth = canvasHeight = blockWidth * palette.length;
      }
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
      if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(canvasWidth / 2, canvasHeight / 2, canvasWidth / 2, 0, 2 * Math.PI);
        ctx.clip();
      }
      palette.forEach((block, index) => {
        ctx.fillStyle = block.color;
        ctx.fillRect(0, index * blockHeight, canvasWidth, blockHeight);
      });
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'artwork.png';
        a.click();
        URL.revokeObjectURL(url);
        setLoading(false);
        console.log('Artwork exported.');
      }, 'image/png');
    } catch (error) {
      console.error('Error exporting artwork:', error);
      Sentry.captureException(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      <header className="p-4 bg-white shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Color Palette Artwork</h1>
        <div className="text-sm">
          <a href="https://www.zapt.ai" target="_blank" rel="noopener noreferrer" className="underline">
            Made on ZAPT
          </a>
        </div>
      </header>
      <main className="flex-grow p-4">
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

        {palette.length > 0 && (
          <>
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
          </>
        )}
      </main>
      <footer className="p-4 bg-white shadow-inner text-center text-xs">
        &copy; {new Date().getFullYear()} Color Palette Artwork. All rights reserved.
      </footer>
    </div>
  );
}