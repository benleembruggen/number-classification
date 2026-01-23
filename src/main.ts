import * as tf from '@tensorflow/tfjs';

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

// Load model once at startup (Graph model format)
let model: tf.GraphModel | null = null;
tf.loadGraphModel('./tfjs_model/model.json').then((loadedModel) => {
  model = loadedModel;
  console.log('Model loaded successfully');
}).catch((err) => {
  console.error('Failed to load model:', err);
});

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
predictBtn.addEventListener('click', async () => {
  if (!model) {
    console.error('Model not loaded yet');
    return;
  }

  // Normalize pixel values (0-255 -> 0-1) and reshape to [batch, 28, 28]
  const input = tf.tensor(pixels).div(255).reshape([1, 28, 28]);
  
  const prediction = model.predict(input) as tf.Tensor;
  const predictedDigit = prediction.argMax(1).dataSync()[0];
  const probabilities = prediction.dataSync();
  
  console.log('Predicted digit:', predictedDigit);
  console.log('Probabilities:', Array.from(probabilities));
  
  // Clean up tensors
  input.dispose();
  prediction.dispose();
});

// Initial render
render(ctx, pixels);
