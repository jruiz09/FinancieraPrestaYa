import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'
import { Toaster } from 'react-hot-toast'
import 'leaflet/dist/leaflet.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
        <Toaster
    position="bottom-right"
    toastOptions={{
      duration: 3000
    }}
  />
    </BrowserRouter>
  </React.StrictMode>
)
