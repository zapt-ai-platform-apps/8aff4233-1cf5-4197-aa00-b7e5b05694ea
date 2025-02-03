export async function extractColors(img, numColors) {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const colorCount = {};
      const totalPixels = canvas.width * canvas.height;
      const stride = 4 * 10; // sample every 10th pixel

      for (let i = 0; i < data.length; i += stride) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        if (a < 128) continue;
        const key = `${Math.round(r/10)*10},${Math.round(g/10)*10},${Math.round(b/10)*10}`;
        if (colorCount[key]) {
          colorCount[key]++;
        } else {
          colorCount[key] = 1;
        }
      }

      const sortedColors = Object.entries(colorCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, numColors);

      const palette = sortedColors.map(([key, count]) => {
        const [r, g, b] = key.split(',').map(Number);
        const percentage = ((count / totalPixels) * 100).toFixed(2);
        return { color: `rgb(${r}, ${g}, ${b})`, percentage };
      });

      resolve(palette);
    } catch (error) {
      reject(error);
    }
  });
}