import { GRID_SIZE, PIXEL_SIZE, PIXEL_PADDING, CANVAS_SIZE } from './constants';
import type { PixelGrid, PixelCoords } from './types';

export function render(ctx: CanvasRenderingContext2D, pixels: PixelGrid): void {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  
  // Draw all pixels (both filled and empty with white background)
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const x = col * PIXEL_SIZE + PIXEL_PADDING;
      const y = row * PIXEL_SIZE + PIXEL_PADDING;
      const width = PIXEL_SIZE - PIXEL_PADDING * 2;
      const height = PIXEL_SIZE - PIXEL_PADDING * 2;
      const radius = 2;
      
      // Determine color based on pixel value
      let grayValue: number;
      if (pixels[row][col] > 0) {
        grayValue = 255 - pixels[row][col];
      } else {
        grayValue = 240; // Light gray for empty pixels
      }
      
      ctx.fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
      
      // Draw rounded rectangle
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.arcTo(x + width, y, x + width, y + radius, radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
      ctx.lineTo(x + radius, y + height);
      ctx.arcTo(x, y + height, x, y + height - radius, radius);
      ctx.lineTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
      ctx.closePath();
      ctx.fill();
    }
  }
}

export function getPixelCoords(canvas: HTMLCanvasElement, e: MouseEvent): PixelCoords {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const col = Math.floor(x / PIXEL_SIZE);
  const row = Math.floor(y / PIXEL_SIZE);
  return { row, col };
}
