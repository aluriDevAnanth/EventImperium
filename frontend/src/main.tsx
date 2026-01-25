import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { AuthPro } from './context/AuthContext.tsx'
import 'bootstrap-icons/font/bootstrap-icons.css';


createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthPro>
      <App />
    </AuthPro>
  </BrowserRouter>,
)
