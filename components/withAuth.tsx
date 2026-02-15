'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

/**
 * Higher-order component for protecting routes
 * Redirects to /login if user is not authenticated
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function ProtectedRoute(props: P) {
    const router = useRouter()

    useEffect(() => {
      if (!isAuthenticated()) {
        router.push('/login')
      }
    }, [router])

    // Don't render the component if not authenticated
    if (!isAuthenticated()) {
      return null
    }

    return <Component {...props} />
  }
}

