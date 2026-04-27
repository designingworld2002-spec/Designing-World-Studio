export const checkImageBlur = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(false);
        return;
      }
      
      const width = img.width;
      const height = img.height;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;

      // Convert to grayscale
      const grays = new Float32Array(width * height);
      for (let i = 0; i < pixels.length; i += 4) {
        grays[i / 4] = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
      }

      // Calculate Laplacian
      const laplacian = new Float32Array(width * height);
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          const val = 
            -1 * grays[(y - 1) * width + x] +
            -1 * grays[y * width + (x - 1)] +
             4 * grays[idx] +
            -1 * grays[y * width + (x + 1)] +
            -1 * grays[(y + 1) * width + x];
          laplacian[idx] = val;
        }
      }

      // Calculate variance of Laplacian
      let mean = 0;
      for (let i = 0; i < laplacian.length; i++) {
        mean += laplacian[i];
      }
      mean /= laplacian.length;

      let variance = 0;
      for (let i = 0; i < laplacian.length; i++) {
        variance += Math.pow(laplacian[i] - mean, 2);
      }
      variance /= laplacian.length;

      // Threshold for blur detection (can be adjusted based on testing, usually 100-300 is common)
      // Lower variance means blurrier image.
      resolve(variance < 100); 
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(false);
      URL.revokeObjectURL(url);
    }
    img.src = url;
  });
};
