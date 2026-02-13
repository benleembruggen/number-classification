import { GRID_SIZE } from './constants';
import type { PixelGrid } from './types';

interface BoundingBox {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
}

/**
 * Find the bounding box of all non-zero pixels.
 */
function getBoundingBox(pixels: PixelGrid): BoundingBox | null {
  let minRow = GRID_SIZE;
  let maxRow = -1;
  let minCol = GRID_SIZE;
  let maxCol = -1;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (pixels[r][c] > 0) {
        if (r < minRow) minRow = r;
        if (r > maxRow) maxRow = r;
        if (c < minCol) minCol = c;
        if (c > maxCol) maxCol = c;
      }
    }
  }

  if (maxRow === -1) return null;
  return { minRow, maxRow, minCol, maxCol };
}

/**
 * Crop the pixel grid to the bounding box region.
 */
function crop(pixels: PixelGrid, bbox: BoundingBox): number[][] {
  const { minRow, maxRow, minCol, maxCol } = bbox;
  const height = maxRow - minRow + 1;
  const width = maxCol - minCol + 1;

  const result: number[][] = [];
  for (let r = 0; r < height; r++) {
    result[r] = [];
    for (let c = 0; c < width; c++) {
      result[r][c] = pixels[minRow + r][minCol + c];
    }
  }
  return result;
}

/**
 * Resize an image to fit within targetSize x targetSize while preserving aspect ratio.
 * Uses bilinear interpolation.
 */
function resizeToFit(image: number[][], targetSize: number): number[][] {
  const srcHeight = image.length;
  const srcWidth = image[0].length;

  const scale = targetSize / Math.max(srcHeight, srcWidth);
  const newHeight = Math.max(1, Math.round(srcHeight * scale));
  const newWidth = Math.max(1, Math.round(srcWidth * scale));

  const result: number[][] = [];
  for (let r = 0; r < newHeight; r++) {
    result[r] = [];
    for (let c = 0; c < newWidth; c++) {
      // Map destination pixel center back to source coordinates
      const srcR = (r + 0.5) * (srcHeight / newHeight) - 0.5;
      const srcC = (c + 0.5) * (srcWidth / newWidth) - 0.5;

      const r0 = Math.max(0, Math.floor(srcR));
      const r1 = Math.min(srcHeight - 1, r0 + 1);
      const c0 = Math.max(0, Math.floor(srcC));
      const c1 = Math.min(srcWidth - 1, c0 + 1);

      const dr = Math.max(0, srcR - r0);
      const dc = Math.max(0, srcC - c0);

      result[r][c] =
        image[r0][c0] * (1 - dr) * (1 - dc) +
        image[r1][c0] * dr * (1 - dc) +
        image[r0][c1] * (1 - dr) * dc +
        image[r1][c1] * dr * dc;
    }
  }

  return result;
}

/**
 * Place a small image onto a 28x28 grid, positioning it so the center of mass
 * aligns with the center of the grid (matching MNIST centering).
 */
function centerByMass(image: number[][], gridSize: number): number[][] {
  const height = image.length;
  const width = image[0].length;

  // Calculate center of mass of the small image
  let totalMass = 0;
  let comR = 0;
  let comC = 0;

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const val = image[r][c];
      totalMass += val;
      comR += r * val;
      comC += c * val;
    }
  }

  if (totalMass === 0) {
    return Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(0));
  }

  comR /= totalMass;
  comC /= totalMass;

  // Center of the 28x28 grid (continuous center)
  const gridCenter = (gridSize - 1) / 2;
  const offsetR = Math.round(gridCenter - comR);
  const offsetC = Math.round(gridCenter - comC);

  const result: number[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(0));

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const newR = r + offsetR;
      const newC = c + offsetC;
      if (newR >= 0 && newR < gridSize && newC >= 0 && newC < gridSize) {
        result[newR][newC] = image[r][c];
      }
    }
  }

  return result;
}

/**
 * Apply a 3x3 Gaussian blur to smooth hard pixel edges.
 */
function gaussianBlur(pixels: number[][], gridSize: number): number[][] {
  const kernel = [
    [1, 2, 1],
    [2, 4, 2],
    [1, 2, 1],
  ];
  const kernelSum = 16;

  const result: number[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(0));

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      let sum = 0;
      for (let kr = -1; kr <= 1; kr++) {
        for (let kc = -1; kc <= 1; kc++) {
          const sr = r + kr;
          const sc = c + kc;
          if (sr >= 0 && sr < gridSize && sc >= 0 && sc < gridSize) {
            sum += pixels[sr][sc] * kernel[kr + 1][kc + 1];
          }
        }
      }
      result[r][c] = sum / kernelSum;
    }
  }

  return result;
}

/**
 * Preprocess drawn pixels to match MNIST training data format:
 * 1. Crop to bounding box of the drawn digit
 * 2. Resize to fit within 20x20 pixels (preserving aspect ratio)
 * 3. Center in 28x28 grid by center of mass
 * 4. Apply light Gaussian blur for smoothing
 */
export function preprocessPixels(pixels: PixelGrid): PixelGrid {
  const bbox = getBoundingBox(pixels);
  if (!bbox) return pixels;

  const cropped = crop(pixels, bbox);
  const resized = resizeToFit(cropped, 20);
  const centered = centerByMass(resized, GRID_SIZE);
  const blurred = gaussianBlur(centered, GRID_SIZE);

  return blurred;
}
