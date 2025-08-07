import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/enhanced-button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, CheckCircle, XCircle, Lock } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuthSecurity } from '@/hooks/useAuthSecurity'
import ThemeToggle from '@/components/ThemeToggle'

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const { validatePassword } = useAuthSecurity()

  const passwordValidation = validatePassword(password)

  useEffect(() => {
    // Check if we have the necessary parameters
    const token = searchParams.get('token')
    const type = searchParams.get('type')
    
    if (!token || type !== 'recovery') {
      setError('Enlace de recuperación inválido o expirado')
    }
  }, [searchParams])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordValidation.isValid) {
      setError('La contraseña no cumple con los requisitos de seguridad')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
      } else {
        toast({
          title: "Contraseña actualizada",
          description: "Tu contraseña ha sido actualizada exitosamente. Serás redirigido al login.",
        })
        
        // Redirect to login after success
        setTimeout(() => {
          navigate('/auth')
        }, 2000)
      }
    } catch (error: any) {
      setError('Error al actualizar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = (strength: 'weak' | 'medium' | 'strong' | 'very-strong') => {
    switch(strength) {
      case 'weak': return 'bg-destructive'
      case 'medium': return 'bg-yellow-500'
      case 'strong': return 'bg-green-500'
      case 'very-strong': return 'bg-green-600'
      default: return 'bg-destructive'
    }
  }

  const getPasswordStrengthValue = (strength: 'weak' | 'medium' | 'strong' | 'very-strong') => {
    switch(strength) {
      case 'weak': return 25
      case 'medium': return 50
      case 'strong': return 75
      case 'very-strong': return 100
      default: return 0
    }
  }

  const getPasswordStrengthText = (strength: 'weak' | 'medium' | 'strong' | 'very-strong') => {
    switch(strength) {
      case 'weak': return 'Débil'
      case 'medium': return 'Regular'
      case 'strong': return 'Buena'
      case 'very-strong': return 'Excelente'
      default: return 'Débil'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Restablecer Contraseña
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Ingresa tu nueva contraseña
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-6">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* Nueva Contraseña */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Nueva Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu nueva contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Seguridad de la contraseña
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getPasswordStrengthText(passwordValidation.strength)}
                      </span>
                    </div>
                    <Progress 
                      value={getPasswordStrengthValue(passwordValidation.strength)} 
                      className={`h-2 ${getPasswordStrengthColor(passwordValidation.strength)}`}
                    />
                    
                    {passwordValidation.errors.length > 0 && (
                      <div className="space-y-1">
                        {passwordValidation.errors.map((error, index) => (
                          <p key={index} className="text-xs text-destructive flex items-center">
                            <XCircle className="h-3 w-3 mr-1" />
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirma tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive flex items-center">
                    <XCircle className="h-3 w-3 mr-1" />
                    Las contraseñas no coinciden
                  </p>
                )}

                {confirmPassword && password === confirmPassword && passwordValidation.isValid && (
                  <p className="text-xs text-green-600 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Las contraseñas coinciden
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                disabled={loading || !passwordValidation.isValid || password !== confirmPassword}
              >
                {loading ? "Actualizando..." : "Actualizar Contraseña"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/auth')}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Volver al login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResetPassword