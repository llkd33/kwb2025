import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n' // Initialize i18n
import { LanguageProvider } from './contexts/LanguageContext'

// Suppress known noisy unhandled promise rejections from certain browser extensions
// Only prevents default when the error clearly originates from a chrome extension background/page script
window.addEventListener('unhandledrejection', (event) => {
  try {
    const reason = event?.reason;
    const msg = typeof reason?.message === 'string' ? reason.message : '';
    const stack = typeof reason?.stack === 'string' ? reason.stack : '';
    const isExt = stack.includes('chrome-extension://') || stack.includes('background.js');
    const isPerm = /permission error/i.test(msg);
    if (isExt && isPerm) {
      event.preventDefault();
    }
  } catch { /* no-op */ }
});

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
