'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, UserResponse } from '@/lib/api'
import { logout, isAuthenticated } from '@/lib/auth'

function DashboardContent() {
  const router = useRouter()
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    // Fetch user data
    const fetchUser = async () => {
      setIsLoading(true)
      const response = await getCurrentUser()

      if (response.error) {
        // If unauthorized, redirect to login
        if (response.status === 401) {
          logout()
          return
        }
        setError(response.error)
        setIsLoading(false)
        return
      }

      if (response.data) {
        setUser(response.data)
      }
      setIsLoading(false)
    }

    fetchUser()
  }, [router])

  const handleLogout = () => {
    logout()
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        padding: '1rem', 
        background: '#fee', 
        border: '1px solid #fcc',
        borderRadius: '4px',
        color: '#c33',
        margin: '2rem'
      }}>
        Error: {error}
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f5f5f5',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <header style={{
        background: 'white',
        borderBottom: '1px solid #ddd',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            background: '#f44',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Logout
        </button>
      </header>

      <main style={{ padding: '2rem' }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginTop: 0 }}>Welcome!</h2>
          {user && (
            <div>
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Email:</strong> {user.email}
              </p>
              <p style={{ margin: '0.5rem 0' }}>
                <strong>User ID:</strong> {user.id}
              </p>
            </div>
          )}
        </div>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0 }}>Protected Content</h3>
          <p>This page is only accessible to authenticated users.</p>
          <p>Your authentication token is automatically included in API requests.</p>
        </div>
      </main>
    </div>
  )
}

export default DashboardContent

