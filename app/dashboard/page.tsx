'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, UserResponse, uploadFile, getFiles, deleteFile, FileItem } from '@/lib/api'
import { logout, isAuthenticated } from '@/lib/auth'

function DashboardContent() {
  const router = useRouter()
  const [user, setUser] = useState<UserResponse | null>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    // Fetch user data and files
    const fetchData = async () => {
      setIsLoading(true)
      
      // Fetch user
      const userResponse = await getCurrentUser()
      if (userResponse.error) {
        if (userResponse.status === 401) {
          logout()
          return
        }
        setError(userResponse.error)
        setIsLoading(false)
        return
      }

      if (userResponse.data) {
        setUser(userResponse.data)
      }

      // Fetch files
      const filesResponse = await getFiles()
      if (filesResponse.error) {
        if (filesResponse.status === 401) {
          logout()
          return
        }
        // Don't set error if files endpoint fails, just log it
        console.error('Failed to fetch files:', filesResponse.error)
      } else if (filesResponse.data) {
        setFiles(filesResponse.data)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [router])

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setIsUploading(true)
    setUploadError('')

    const response = await uploadFile(selectedFile)

    if (response.error) {
      if (response.status === 401) {
        logout()
        return
      }
      setUploadError(response.error)
      setIsUploading(false)
      return
    }

    // Refresh files list after successful upload
    const filesResponse = await getFiles()
    if (filesResponse.data) {
      setFiles(filesResponse.data)
    }

    setIsUploading(false)
    
    // Clear the input
    e.target.value = ''
  }

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return
    }

    setDeletingFileId(fileId)

    const response = await deleteFile(fileId)

    if (response.error) {
      if (response.status === 401) {
        logout()
        return
      }
      alert(`Failed to delete file: ${response.error}`)
      setDeletingFileId(null)
      return
    }

    // Remove file from list
    setFiles(files.filter(f => f.id !== fileId))
    setDeletingFileId(null)
  }

  const handleLogout = () => {
    logout()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleString()
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

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* User Info */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginTop: 0, fontSize: '1.25rem' }}>Welcome!</h2>
          {user && (
            <div>
              <p style={{ margin: '0.25rem 0', color: '#666' }}>
                <strong>Email:</strong> {user.email}
              </p>
            </div>
          )}
        </div>

        {/* File Upload */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>Upload File</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label 
              htmlFor="file-upload"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: isUploading ? '#ccc' : '#0070f3',
                color: 'white',
                borderRadius: '4px',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                fontWeight: '500'
              }}
            >
              {isUploading ? 'Uploading...' : 'Choose File'}
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              disabled={isUploading}
              style={{ display: 'none' }}
            />
          </div>

          {uploadError && (
            <div style={{
              padding: '0.75rem',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              color: '#c33',
              fontSize: '0.9rem'
            }}>
              {uploadError}
            </div>
          )}
        </div>

        {/* Files List */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            Your Files ({files.length})
          </h3>

          {files.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '2rem 0' }}>
              No files uploaded yet. Upload your first file above!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {files.map((file) => (
                <div
                  key={file.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#fafafa'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                      {file.filename}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    disabled={deletingFileId === file.id}
                    style={{
                      padding: '0.5rem 1rem',
                      background: deletingFileId === file.id ? '#ccc' : '#f44',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: deletingFileId === file.id ? 'not-allowed' : 'pointer',
                      fontWeight: '500',
                      fontSize: '0.9rem'
                    }}
                  >
                    {deletingFileId === file.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default DashboardContent
