import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppLayout from './components/AppLayout.tsx'
import RequireAuth from './components/RequireAuth.tsx'
import Home from './routes/Home.tsx'
import Tweets from './routes/Tweets.tsx'
import Youtube from './routes/Youtube.tsx'
import Documents from './routes/Documents.tsx'
import Links from './routes/Links.tsx'
import Tags, { TagView } from './routes/Tags.tsx'
import Profile from './routes/Profile.tsx'
import Settings from './routes/Settings.tsx'
import Help from './routes/Help.tsx'
import SharedView from './routes/SharedView.tsx'
import NotFound from './routes/NotFound.tsx'

const router = createBrowserRouter([
  // Public
  { path: "/", element: <App /> },
  { path: "/share/:token", element: <SharedView /> },

  // Signed-in pages share one layout (sidebar, top bar, profile menu)
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { path: "/home", element: <Home /> },
      { path: "/tweets", element: <Tweets /> },
      { path: "/videos", element: <Youtube /> },
      { path: "/documents", element: <Documents /> },
      { path: "/links", element: <Links /> },
      { path: "/tags", element: <Tags /> },
      { path: "/tags/:tag", element: <TagView /> },
      { path: "/profile", element: <Profile /> },
      { path: "/settings", element: <Settings /> },
      { path: "/help", element: <Help /> },
    ],
  },

  { path: "*", element: <NotFound /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
