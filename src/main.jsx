import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HSStaticMethods } from 'preline/non-auto'
import './index.css'
import App from './App.jsx'



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


window.addEventListener("load", () => {
  HSStaticMethods.autoInit();
});