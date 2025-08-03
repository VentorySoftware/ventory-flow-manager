import { useState, useRef, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/enhanced-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthSecurity } from '@/hooks/useAuthSecurity'
import ThemeToggle from '@/components/ThemeToggle'
import LoginTransition from '@/components/LoginTransition'
import { supabase } from '@/integrations/supabase/client'
import { LogIn, UserPlus, Package, Eye, EyeOff, AlertTriangle, CheckCircle, Mail } from 'lucide-react'

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [currentTab, setCurrentTab] = useState('login')
  const [showTransition, setShowTransition] = useState(false)
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '', 
    fullName: '' 
  })
  const [resetEmail, setResetEmail] = useState('')

  const { signIn, signUp, user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const tabsRef = useRef<any>(null)
  
  const {
    recordFailedAttempt,
    clearAttempts,
    isEmailBlocked,
    getAttemptsLeft,
    validateEmail,
    validatePassword,
    setRememberMe: saveRememberMe,
    getRememberedEmail
  } = useAuthSecurity()

  // Cargar email recordado al inicializar
  useEffect(() => {
    const rememberedEmail = getRememberedEmail()
    if (rememberedEmail) {
      setLoginForm(prev => ({ ...prev, email: rememberedEmail }))
      setRememberMe(true)
    }
  }, [])

  // Redirect if already authenticated but NOT during transition animation
  if (user && !showTransition) {
    return <Navigate to="/" replace />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar email
    if (!validateEmail(loginForm.email)) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      })
      return
    }

    // Verificar si el email está bloqueado
    const blockStatus = isEmailBlocked(loginForm.email)
    if (blockStatus.blocked && blockStatus.timeLeft) {
      const minutes = Math.ceil(blockStatus.timeLeft / 1000 / 60)
      toast({
        title: "Cuenta temporalmente bloqueada",
        description: `Demasiados intentos fallidos. Intenta nuevamente en ${minutes} minutos.`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const { error } = await signIn(loginForm.email, loginForm.password)

    if (error) {
      // Registrar intento fallido
      const attempt = recordFailedAttempt(loginForm.email)
      const attemptsLeft = getAttemptsLeft(loginForm.email)
      
      let errorMessage = error.message
      if (attemptsLeft > 0) {
        errorMessage += `. Te quedan ${attemptsLeft} intentos.`
      } else {
        errorMessage = "Cuenta bloqueada por 15 minutos debido a demasiados intentos fallidos."
      }

      toast({
        title: "Error de inicio de sesión",
        description: errorMessage,
        variant: "destructive",
      })
    } else {
      // Limpiar intentos fallidos y guardar preferencia de recordar
      clearAttempts(loginForm.email)
      saveRememberMe(rememberMe, loginForm.email)
      
      // Mostrar animación de transición
      setShowTransition(true)
    }

    setIsLoading(false)
  }

  const handleTransitionComplete = () => {
    navigate('/')
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar email
    if (!validateEmail(signupForm.email)) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      })
      return
    }

    // Validar contraseña
    const passwordValidation = validatePassword(signupForm.password)
    if (!passwordValidation.isValid) {
      toast({
        title: "Contraseña no válida",
        description: passwordValidation.errors[0],
        variant: "destructive",
      })
      return
    }
    
    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const { error } = await signUp(
      signupForm.email, 
      signupForm.password, 
      signupForm.fullName
    )

    if (error) {
      toast({
        title: "Error de registro",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Registro exitoso",
        description: "Revisa tu email para confirmar tu cuenta",
      })
      
      // Resetear formulario de registro
      setSignupForm({
        email: '', 
        password: '', 
        confirmPassword: '', 
        fullName: '' 
      })
      
      // Cambiar a la pestaña de login
      setCurrentTab('login')
    }

    setIsLoading(false)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateEmail(resetEmail)) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      })
      return
    }

    setResetLoading(true)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Email enviado",
          description: "Revisa tu bandeja de entrada para restablecer tu contraseña",
        })
        setResetEmail('')
        setCurrentTab('login')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el email de recuperación",
        variant: "destructive",
      })
    }

    setResetLoading(false)
  }

  const getPasswordStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'strong': return 'bg-blue-500'
      case 'very-strong': return 'bg-green-500'
      default: return 'bg-gray-300'
    }
  }

  const getPasswordStrengthValue = (strength: string) => {
    switch (strength) {
      case 'weak': return 25
      case 'medium': return 50
      case 'strong': return 75
      case 'very-strong': return 100
      default: return 0
    }
  }

  const passwordValidation = validatePassword(signupForm.password)
  const emailValidation = currentTab === 'signup' ? validateEmail(signupForm.email) : validateEmail(loginForm.email)

  // Mostrar animación de transición si login exitoso
  if (showTransition) {
    return <LoginTransition onComplete={handleTransitionComplete} />
  }

  return (
    <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center p-6 relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-2 rounded-full bg-gradient-primary animate-float">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-gradient">
              Ventory Manager
            </h1>
          </div>
          <p className="text-muted-foreground text-lg font-medium">
            Sistema de gestión empresarial inteligente
          </p>
          <div className="h-1 w-20 bg-gradient-primary mx-auto rounded-full"></div>
        </div>

        <Card className="shadow-elegant card-hover backdrop-blur-sm bg-card/95 border-border/50 animate-slide-up">
          <CardHeader className="pb-6">
            <CardTitle className="text-center text-2xl font-heading font-semibold text-gradient">
              BIENVENIDO
            </CardTitle>
            <CardDescription className="text-center text-base text-muted-foreground">
              Accede a tu cuenta empresarial de forma segura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4" ref={tabsRef}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="reset">Recuperar</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">Email corporativo</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="usuario@empresa.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({
                          ...prev,
                          email: e.target.value
                        }))}
                        className={`input-focus transition-all duration-300 ${
                          !emailValidation && loginForm.email 
                            ? "border-destructive pulse-error" 
                            : emailValidation && loginForm.email 
                              ? "border-success pulse-success" 
                              : ""
                        }`}
                        required
                      />
                      {loginForm.email && (
                        <div className="absolute right-3 top-3 transition-all duration-200">
                          {emailValidation ? (
                            <CheckCircle className="h-4 w-4 text-success animate-scale-in" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-destructive animate-scale-in" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({
                          ...prev,
                          password: e.target.value
                        }))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Mostrar intentos restantes si hay intentos fallidos */}
                  {loginForm.email && getAttemptsLeft(loginForm.email) < 5 && getAttemptsLeft(loginForm.email) > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Te quedan {getAttemptsLeft(loginForm.email)} intentos antes del bloqueo temporal.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm">Recordarme</Label>
                  </div>

                  <Button 
                    type="submit" 
                    variant="gradient" 
                    className="w-full"
                    disabled={isLoading || !emailValidation}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Iniciando sesión...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <LogIn className="h-4 w-4" />
                        <span>Iniciar Sesión</span>
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nombre Completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Juan Pérez"
                      value={signupForm.fullName}
                      onChange={(e) => setSignupForm(prev => ({
                        ...prev,
                        fullName: e.target.value
                      }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">Email</Label>
                    <div className="relative">
                      <Input
                        id="signupEmail"
                        type="email"
                        placeholder="tu@email.com"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm(prev => ({
                          ...prev,
                          email: e.target.value
                        }))}
                        className={!emailValidation && signupForm.email ? "border-red-500" : ""}
                        required
                      />
                      {signupForm.email && (
                        <div className="absolute right-3 top-3">
                          {emailValidation ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="signupPassword"
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm(prev => ({
                          ...prev,
                          password: e.target.value
                        }))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showSignupPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    
                    {/* Indicador de fortaleza de contraseña */}
                    {signupForm.password && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Fortaleza de contraseña</span>
                          <span className="capitalize">{passwordValidation.strength}</span>
                        </div>
                        <Progress 
                          value={getPasswordStrengthValue(passwordValidation.strength)} 
                          className="h-2"
                        />
                        
                        {/* Mostrar errores de validación */}
                        {passwordValidation.errors.length > 0 && (
                          <div className="space-y-1">
                            {passwordValidation.errors.map((error, index) => (
                              <p key={index} className="text-xs text-red-500 flex items-center space-x-1">
                                <AlertTriangle className="h-3 w-3" />
                                <span>{error}</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm(prev => ({
                          ...prev,
                          confirmPassword: e.target.value
                        }))}
                        className={
                          signupForm.confirmPassword && 
                          signupForm.password !== signupForm.confirmPassword 
                            ? "border-red-500" : ""
                        }
                        required
                      />
                      {signupForm.confirmPassword && (
                        <div className="absolute right-3 top-3">
                          {signupForm.password === signupForm.confirmPassword ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {signupForm.confirmPassword && signupForm.password !== signupForm.confirmPassword && (
                      <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    variant="business" 
                    className="w-full"
                    disabled={isLoading || !passwordValidation.isValid || !emailValidation}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creando cuenta...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <UserPlus className="h-4 w-4" />
                        <span>Crear Cuenta</span>
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="reset">
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Email</Label>
                    <div className="relative">
                      <Input
                        id="resetEmail"
                        type="email"
                        placeholder="tu@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                      <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Te enviaremos un enlace para restablecer tu contraseña.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    type="submit" 
                    variant="outline" 
                    className="w-full"
                    disabled={resetLoading || !validateEmail(resetEmail)}
                  >
                    {resetLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        <span>Enviando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Enviar enlace</span>
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Auth