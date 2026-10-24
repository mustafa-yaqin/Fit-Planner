// Starts the website: wraps the app in language, login and planner data, loads fonts, registers the offline cache.
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { PlannerProvider } from './context/PlannerContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
// Fonts (kept on our own server). Vazirmatn is a PERSIAN font; its "arabic" file is just the name of the
// script block that holds the Persian letters and digits. Only the needed letters and weights are loaded.
import '@fontsource/vazirmatn/arabic-400.css'
import '@fontsource/vazirmatn/arabic-700.css'
import '@fontsource/vazirmatn/latin-400.css'
import '@fontsource/vazirmatn/latin-700.css'
import '@fontsource/poppins/latin-400.css'
import '@fontsource/poppins/latin-600.css'
import '@fontsource/poppins/latin-700.css'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LanguageProvider>
        <AuthProvider>
          <PlannerProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </PlannerProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
)

// Offline cache (production build only, so the dev console stays clean)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
