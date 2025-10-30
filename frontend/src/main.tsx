import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Intro from './routes/Intro.tsx'
import Home from './routes/Home.tsx'

const router = createBrowserRouter([
  {path:"/", element:<App/>},
  {path:"/intro", element:<Intro/>},
  {path:"/home", element:<Home/>}
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
