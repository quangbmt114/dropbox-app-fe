'use client'

import { useEffect, useState } from 'react'
import { authApi } from '@/api-service'

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<string>('Checking...')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHealth = async () => {
      setIsLoading(true)
      const response = await authApi.checkHealth()

      if (response.error) {
        setHealthStatus(`Error: ${response.error}`)
      } else if (response.data) {
        setHealthStatus(`API Status: ${response.data.status}`)
      }

      setIsLoading(false)
    }

    fetchHealth()
  }, [])

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Dropbox Clone - Frontend</h1>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>API Health Check</h2>
        <p>
          {isLoading ? (
            <span>Loading...</span>
          ) : (
            <span>{healthStatus}</span>
          )}
        </p>
        <small style={{ color: '#666' }}>
          API URL: {process.env.NEXT_PUBLIC_API_URL || 'Not configured'}
        </small>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Project Status</h2>
        <ul>
          <li>✅ Next.js App Router</li>
          <li>✅ TypeScript (Strict Mode)</li>
          <li>✅ Redux State Management</li>
          <li>✅ Modular Architecture</li>
          <li>✅ API Client Configuration</li>
          <li>✅ Environment Variables</li>
          <li>✅ Authentication (Implemented)</li>
          <li>✅ File Management (Implemented)</li>
          <li>⏳ UI Styling (Not Implemented)</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Quick Links</h2>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <a
            href="/login"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#0070f3',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: '500'
            }}
          >
            Login
          </a>
          <a
            href="/register"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#10b981',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: '500'
            }}
          >
            Register
          </a>
          <a
            href="/dashboard"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#6366f1',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: '500'
            }}
          >
            Dashboard
          </a>
        </div>
      </div>
    </main>
  )
}

