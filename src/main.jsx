import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ScrollProvider } from './context/ScrollProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ScrollProvider>
          <App />
    </ScrollProvider>
  </StrictMode>,
)
