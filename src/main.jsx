import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { UploadProvider } from "./context/UploadContext";
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'

const router = createBrowserRouter(
  [
    {
      path: '*',
      element: <App />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UploadProvider>
      <RouterProvider router={router} />
    </UploadProvider>
  </React.StrictMode>
)
