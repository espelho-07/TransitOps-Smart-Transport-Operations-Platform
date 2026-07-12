import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { UIProvider } from './context/UIContext';
import { AuthProvider } from './context/AuthContext';
import { router } from './routes';
import './styles/index.css';

function App() {
  return (
    <ThemeProvider>
      <UIProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" reverseOrder={false} />
        </AuthProvider>
      </UIProvider>
    </ThemeProvider>
  );
}

export default App;
