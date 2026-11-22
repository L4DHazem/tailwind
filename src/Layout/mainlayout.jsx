import React from 'react'
import Navbar from '../Component/navbar'
import { Outlet } from 'react-router-dom'
import Footer from '../Component/footer'

export default function Mainlayout() {
    return (
        <div>

            <Navbar />

            <Outlet />

            <Footer />

        </div>
    )
}
