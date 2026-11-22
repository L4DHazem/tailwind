import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Authprotectedrout({ children }) {
    const [session, setSession] = useState(undefined) // undefined = loading

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
        })
    }, [])

    // Still checking → show nothing (or a spinner)
    if (session === undefined) return null

    // Has valid session → redirect away from Login/Register
    if (session) return <Navigate to="/" replace />

    // No session → show the auth page
    return children
}