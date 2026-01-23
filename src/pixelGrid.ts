import { GRID_SIZE } from './constants';
import type { PixelGrid } from './types';

export function createEmptyGrid(): PixelGrid {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
}

export function fillPixel(pixels: PixelGrid, row: number, col: number): void {
  if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
    pixels[row][col] = 255; // Full black
    
    // Add slight gradient to neighboring pixels for smoother drawing
    const neighbors: [number, number][] = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1]
    ];
    
    neighbors.forEach(([r, c]) => {
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        pixels[r][c] = Math.max(pixels[r][c], 180);
      }
    });
  }
}
