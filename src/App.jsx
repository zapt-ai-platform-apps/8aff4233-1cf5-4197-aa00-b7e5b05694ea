import React, { useState, useRef } from 'react';
import * as Sentry from '@sentry/browser';
import { extractColors } from './colorUtils';
import ImageProcessor from './components/ImageProcessor';
import PaletteManager from './components/PaletteManager';

export default function App() {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [palette, setPalette] = useState([]);
  const [numColors, setNumColors] = useState(5);
  const [shape, setShape] = useState('square');
  const [transparentBackground, setTransparentBackground] = useState(false);
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
        const src = event.target.result;
        setImageSrc(src);
        const img = new Image();
        img.onload = async () => {
          setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
          try {
            const colors = await extractColors(img, numColors);
            setPalette(colors);
          } catch (error) {
            console.error('Error extracting colors:', error);
            Sentry.captureException(error);
          }
          setLoading(false);
        };
        img.src = src;
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

  const remixPalette = () => {
    const shuffled = [...palette].sort(() => Math.random() - 0.5);
    setPalette(shuffled);
  };

  const exportArtwork = () => {
    if (!palette.length) return;
    setLoading(true);
    try {
      const canvas = document.createElement('canvas');
      let canvasWidth = 300;
      let canvasHeight = 300;
      if (shape === 'square') {
        canvasWidth = imageDimensions ? imageDimensions.width : 300;
        canvasHeight = canvasWidth;
      } else if (shape === 'rectangle') {
        canvasWidth = imageDimensions ? imageDimensions.width : 300;
        canvasHeight = imageDimensions ? imageDimensions.height : 200;
      } else if (shape === 'circle') {
        canvasWidth = imageDimensions ? Math.min(imageDimensions.width, imageDimensions.height) : 300;
        canvasHeight = canvasWidth;
      }
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
      if (!transparentBackground) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
      if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(canvasWidth / 2, canvasHeight / 2, canvasWidth / 2, 0, 2 * Math.PI);
        ctx.clip();
      }
      const blockHeight = canvasHeight / palette.length;
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
          <a href="https://www.zapt.ai" target="_blank" rel="noopener noreferrer" className="underline cursor-pointer">
            Made on ZAPT
          </a>
        </div>
      </header>
      <main className="flex-grow p-4">
        <ImageProcessor
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          imageSrc={imageSrc}
          loading={loading}
        />
        {palette.length > 0 && (
          <PaletteManager
            palette={palette}
            numColors={numColors}
            setNumColors={setNumColors}
            shape={shape}
            setShape={setShape}
            transparentBackground={transparentBackground}
            setTransparentBackground={setTransparentBackground}
            remixPalette={remixPalette}
            exportArtwork={exportArtwork}
            loading={loading}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
          />
        )}
      </main>
      <footer className="p-4 bg-white shadow-inner text-center text-xs">
        &copy; {new Date().getFullYear()} Color Palette Artwork. All rights reserved.
      </footer>
    </div>
  );
}