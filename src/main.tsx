import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// HashRouter (não BrowserRouter): o build também é publicado como artifact
// de página única, onde não há servidor para resolver rotas profundas
// (ex: /inbox) em um recarregamento direto — hash routing evita isso.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
