import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// Create a root for rendering React components
const container = document.getElementById('root');
const root = createRoot(container);

// Render the React app
root.render(<App />); 