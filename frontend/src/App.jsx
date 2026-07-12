import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { UIProvider } from './context/UIContext';
import { router } from './routes';
import './styles/index.css';

function App() {
  return (
    <ThemeProvider>
      <UIProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" reverseOrder={false} />
      </UIProvider>
    </ThemeProvider>
  );
}

export default App;
