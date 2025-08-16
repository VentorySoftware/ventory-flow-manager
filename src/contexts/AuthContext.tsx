import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  userRole: string | null
  userProfile: { 
    full_name: string | null
    phone: string | null 
    avatar_url: string | null 
  } | null
  loading: boolean
  showPostLoginAnimation: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  hasRole: (role: string) => boolean
  completePostLoginAnimation: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<{ 
    full_name: string | null
    phone: string | null 
    avatar_url: string | null 
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPostLoginAnimation, setShowPostLoginAnimation] = useState(false)

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        // Fetch user role and profile when user is authenticated
        if (session?.user) {
          setTimeout(async () => {
            try {
              // Fetch user role
              const { data: roleData } = await supabase.rpc('get_user_role', {
                _user_id: session.user.id
              })
              setUserRole(roleData)
              
              // Fetch user profile
              const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name, phone, avatar_url')
                .eq('user_id', session.user.id)
                .single()
              
              setUserProfile(profileData)
            } catch (error) {
              console.error('Error fetching user data:', error)
              setUserRole('user') // Default fallback
              setUserProfile(null)
            }
          }, 0)
        } else {
          setUserRole(null)
          setUserProfile(null)
        }
        
        setLoading(false)
      }
    )

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Check if user is active
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_active')
          .eq('user_id', data.user.id)
          .single()

        if (profileError) {
          console.error('Profile check error:', profileError)
          throw new Error('Error al verificar el estado del usuario')
        }

        if (!profile?.is_active) {
          // Sign out the user immediately
          await supabase.auth.signOut()
          throw new Error('Tu cuenta ha sido inhabilitada. Contacta al administrador.')
        }

        // Trigger post-login animation on successful login
        setShowPostLoginAnimation(true)
      }

      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setShowPostLoginAnimation(false) // Reset animation state on logout
  }

  const completePostLoginAnimation = () => {
    setShowPostLoginAnimation(false)
  }

  const hasRole = (role: string): boolean => {
    if (!userRole) return false
    
    // Admin has access to everything
    if (userRole === 'admin') return true
    
    // Moderator has access to user-level functions
    if (userRole === 'moderator' && role === 'user') return true
    
    // Exact role match
    return userRole === role
  }

  const value = {
    user,
    session,
    userRole,
    userProfile,
    loading,
    showPostLoginAnimation,
    signIn,
    signUp,
    signOut,
    hasRole,
    completePostLoginAnimation,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}