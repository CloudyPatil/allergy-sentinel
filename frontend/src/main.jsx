import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AllergyProvider } from './context/AllergyContext.jsx' // <--- IMPORT

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AllergyProvider> {/* <--- WRAP APP */}
        <App />
      </AllergyProvider>
    </ThemeProvider>
  </React.StrictMode>,
)