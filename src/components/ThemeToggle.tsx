import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/enhanced-button"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
        <div className="h-4 w-4" />
      </Button>
    )
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleTheme}
      className="h-9 w-9 p-0 hover-scale transition-smooth"
      title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-yellow-500 transition-smooth" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300 transition-smooth" />
      )}
    </Button>
  )
}

export default ThemeToggle