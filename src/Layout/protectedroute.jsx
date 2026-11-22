import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Protectedroute({ children }) {
    const [session, setSession] = useState(undefined) // undefined = loading

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
        })
    }, [])

    // Still checking → show nothing (or a spinner)
    if (session === undefined) return null

    // No session → redirect to Login
    if (!session) return <Navigate to="/Login" replace />

    // Has valid session → allow access
    return children
}