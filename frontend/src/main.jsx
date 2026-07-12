import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Diagnostic error interceptor for white screens
window.addEventListener('error', (event) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 24px; color: #ef4444; background: #09090b; border: 1px solid #ef4444; border-radius: 8px; font-family: monospace; max-width: 800px; margin: 40px auto; line-height: 1.6;">
        <h3 style="margin-top: 0; font-size: 18px; font-weight: bold;">TransitOps Diagnostic: Runtime Error Caught</h3>
        <p style="font-size: 14px; font-weight: bold; margin: 12px 0;">Error: ${event.message}</p>
        <p style="font-size: 12px; color: #a1a1aa;">Source: ${event.filename}:${event.lineno}:${event.colno}</p>
        <pre style="margin-top: 16px; padding: 12px; background: #18181b; border: 1px solid #2e2e34; border-radius: 4px; overflow-x: auto; font-size: 12px; color: #f4f4f5;">${event.error?.stack || 'No stack trace available'}</pre>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 24px; color: #f59e0b; background: #09090b; border: 1px solid #f59e0b; border-radius: 8px; font-family: monospace; max-width: 800px; margin: 40px auto; line-height: 1.6;">
        <h3 style="margin-top: 0; font-size: 18px; font-weight: bold;">TransitOps Diagnostic: Unhandled Rejection</h3>
        <p style="font-size: 14px; font-weight: bold; margin: 12px 0;">Reason: ${event.reason}</p>
        <pre style="margin-top: 16px; padding: 12px; background: #18181b; border: 1px solid #2e2e34; border-radius: 4px; overflow-x: auto; font-size: 12px; color: #f4f4f5;">${event.reason?.stack || 'No stack trace available'}</pre>
      </div>
    `;
  }
});


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


