import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: string[]
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole = [] 
}) => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user && !loading) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to /login via useEffect
  }

  if (requiredRole.length > 0 && !requiredRole.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this resource.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}