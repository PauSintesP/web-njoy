import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

app.add_middleware(
  CORSMiddleware,
  allow_origins = [
    "http://localhost:5173",
    "https://web-njoy.vercel.app/",
    "https://*.vercel.app",
  ],
  allow_credentials = True,
  allow_methods = ["*"],
  allow_headers = ["*"],
)
