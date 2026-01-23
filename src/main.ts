import * as tf from '@tensorflow/tfjs';
import './style.css';
import { CANVAS_SIZE } from './constants';
import { createEmptyGrid, fillPixel } from './pixelGrid';
import { render, getPixelCoords } from './canvas';

// DOM elements
const canvas = document.getElementById('pixelCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
const buckets = document.querySelectorAll('.bucket');

canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

// State
let pixels = createEmptyGrid();
let isDrawing = false;
let predictionTimeout: number | null = null;
let model: tf.GraphModel | null = null;

// Load model
tf.loadGraphModel('./tfjs_model/model.json')
  .then((m) => {
    model = m;
    console.log('Model loaded');
  })
  .catch((err) => console.error('Failed to load model:', err));

// Prediction
function runPrediction(): void {
  if (!model) return;

  // Normalize pixel values (0-255 -> 0-1) and reshape to [batch, 28, 28]
  const input = tf.tensor(pixels).div(255).reshape([1, 28, 28]);
  const prediction = model.predict(input) as tf.Tensor;
  const probabilities = Array.from(prediction.dataSync());

  updateBuckets(probabilities);

  input.dispose();
  prediction.dispose();
}

// Debounced prediction to avoid running on every pixel
function schedulePrediction(): void {
  if (predictionTimeout) clearTimeout(predictionTimeout);
  predictionTimeout = window.setTimeout(runPrediction, 10);
}

// Bucket display
function updateBuckets(probabilities: number[]): void {
  const maxIndex = probabilities.indexOf(Math.max(...probabilities));

  buckets.forEach((bucket, i) => {
    const fill = bucket.querySelector('.bucket-fill') as HTMLElement;
    fill.style.height = `${probabilities[i] * 100}%`;
    bucket.classList.toggle('highest', i === maxIndex);
  });
}

function resetBuckets(): void {
  buckets.forEach((bucket) => {
    const fill = bucket.querySelector('.bucket-fill') as HTMLElement;
    fill.style.height = '0%';
    bucket.classList.remove('highest');
  });
}

// Drawing handlers
function handleDraw(e: MouseEvent | Touch): void {
  const { row, col } = getPixelCoords(canvas, e as MouseEvent);
  fillPixel(pixels, row, col);
  render(ctx, pixels);
  schedulePrediction();
}

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  handleDraw(e);
});

canvas.addEventListener('mousemove', (e) => {
  if (isDrawing) handleDraw(e);
});

canvas.addEventListener('mouseup', () => (isDrawing = false));
canvas.addEventListener('mouseleave', () => (isDrawing = false));

// Touch support
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  isDrawing = true;
  handleDraw(e.touches[0]);
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (isDrawing) handleDraw(e.touches[0]);
});

canvas.addEventListener('touchend', () => (isDrawing = false));

// Clear button
clearBtn.addEventListener('click', () => {
  pixels = createEmptyGrid();
  render(ctx, pixels);
  resetBuckets();
});

// Initialize
render(ctx, pixels);
resetBuckets();
