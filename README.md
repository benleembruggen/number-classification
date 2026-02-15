# number-classification

An interactive web application that uses a neural network to recognise handwritten digits (0-9) in real-time. Draw a digit on the canvas and watch as the model predicts what number you've drawn.


https://github.com/user-attachments/assets/e6db5683-d85a-4234-8816-a1bafe27b1f5


🎨 **[Try the Live Demo](https://benleembruggen.github.io/number-classification/)**

## What It Does

This project combines machine learning with an interactive visualisation to demonstrate digit recognition. Users can draw digits on a large canvas, and the application:

- Preprocesses the drawing to match MNIST format
- Displays the normalised 28×28 input that the neural network receives
- Runs real-time predictions showing probability distributions for each digit (0-9)
- Highlights the most likely digit with visual feedback

## Technologies Used

### Machine Learning

- **TensorFlow/Keras** - Training the neural network on the MNIST dataset
- **TensorFlow.js** - Running the trained model in the browser
- **Python/Jupyter Notebook** - Model development and training

## Model Architecture

The neural network is a Sequential model with:

- Input: 28×28 grayscale images (flattened to 784 pixels)
- Hidden layer: 256 neurons with ReLU activation
- Dropout layer: 0.2 rate for regularization
- Output layer: 10 neurons (one per digit) with Softmax activation

The model achieves high accuracy on the MNIST test dataset.

## Training the Model

The Jupyter notebook (`number_classification.ipynb`) contains the complete pipeline for:

1. Loading and preprocessing the MNIST dataset
2. Building and training the neural network
3. Evaluating model performance
4. Converting the model to TensorFlow.js format for web deployment
