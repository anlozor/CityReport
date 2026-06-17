import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.jsx'

import 'leaflet/dist/leaflet.css' // Para cargar el mapa
import 'react-toastify/ReactToastify.css' // Para los avisos con toast
import { ToastContainer } from 'react-toastify'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <ToastContainer
      position='bottom-right'
      autoClose={3000}
      newestOnTop
    />
  </StrictMode>,
)
