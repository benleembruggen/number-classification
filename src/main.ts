import './style.css';
import { CANVAS_SIZE } from './constants';
import { createEmptyGrid, fillPixel } from './pixelGrid';
import { render, getPixelCoords } from './canvas';

// Reference to the DOM elements
const canvas = document.getElementById('pixelCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
const predictBtn = document.getElementById('predictBtn') as HTMLButtonElement;

canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

// Store pixel states (0-255 grayscale values)
let pixels = createEmptyGrid();
let isDrawing = false;

// Mouse event handlers
canvas.addEventListener('mousedown', (e: MouseEvent) => {
  isDrawing = true;
  const { row, col } = getPixelCoords(canvas, e);
  fillPixel(pixels, row, col);
  render(ctx, pixels);
});

canvas.addEventListener('mousemove', (e: MouseEvent) => {
  if (isDrawing) {
    const { row, col } = getPixelCoords(canvas, e);
    fillPixel(pixels, row, col);
    render(ctx, pixels);
  }
});

canvas.addEventListener('mouseup', () => {
  isDrawing = false;
});

canvas.addEventListener('mouseleave', () => {
  isDrawing = false;
});

// Touch support for mobile
canvas.addEventListener('touchstart', (e: TouchEvent) => {
  e.preventDefault();
  isDrawing = true;
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchmove', (e: TouchEvent) => {
  e.preventDefault();
  if (isDrawing) {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  }
});

canvas.addEventListener('touchend', () => {
  isDrawing = false;
});

// Clear button
clearBtn.addEventListener('click', () => {
  pixels = createEmptyGrid();
  render(ctx, pixels);
});

// Predict button 
predictBtn.addEventListener('click', () => {
  // TODO: update to send pixel data to the model
  console.log('Pixel data:', pixels);
});

// Initial render
render(ctx, pixels);
