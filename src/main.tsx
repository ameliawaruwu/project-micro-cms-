import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Prevent unhandled script errors from breaking the frame
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    // Log cleanly for debugging without unhandled script crash
    if (event.message === 'Script error.') {
      console.warn('Third-party/Cross-origin script notice caught gracefully.');
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Unhandled promise rejection caught:', event.reason);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
