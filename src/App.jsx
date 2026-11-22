import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Mainlayout from './Layout/mainlayout'
import Feedpage from './Pages/feedpage'
import Profilpage from './Pages/profilpage'
import Postdetails from './Pages/postdetails'
import Notfoundpage from './Pages/notfoundpage'
import Authlayout from './Layout/authlayout'
import Login from './Pages/login'
import Register from './Pages/register'
import Protectedroute from './Layout/protectedroute'
import Authprotectedrout from './Layout/authprotectedrout'
import Photo from './Pages/Photo'

function App() {

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Mainlayout />,
      children: [
        { index: true, element: <Protectedroute> <Feedpage /> </Protectedroute> },
        { path: 'profile', element: <Protectedroute> <Profilpage /> </Protectedroute> },
        { path: 'Postdetail', element: <Postdetails /> },
        { path: 'Postdetail/:id', element: <Postdetails /> },
        { path: 'Photo', element: <Photo /> },
        { path: '*', element: <Notfoundpage /> },
      ],
    },
    {
      element: <Authlayout />,
      children: [
        { path: 'Login', element: <Authprotectedrout> <Login /> </Authprotectedrout> },
        { path: 'Register', element: <Authprotectedrout> <Register /> </Authprotectedrout> },
      ],
    },
    {
      path: '*',
      element: <Notfoundpage />,
    },
  ])

  return <>

    <RouterProvider router={router} />

  </>

}

export default App
