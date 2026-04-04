import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/globals.css'

// Bootstrap is handled by useAppStore.initApp() on App mount
const root = createRoot(document.getElementById('root'))
root.render(<App />)
