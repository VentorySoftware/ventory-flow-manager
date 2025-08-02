import { useState, useEffect } from 'react';

interface AuthAttempt {
  email: string;
  attempts: number;
  lastAttempt: number;
  isBlocked: boolean;
}

interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
}

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutos en milisegundos
const ATTEMPT_STORAGE_KEY = 'auth_attempts';

export const useAuthSecurity = () => {
  const [authAttempts, setAuthAttempts] = useState<Record<string, AuthAttempt>>({});

  useEffect(() => {
    // Cargar intentos desde localStorage
    const stored = localStorage.getItem(ATTEMPT_STORAGE_KEY);
    if (stored) {
      try {
        const attempts = JSON.parse(stored);
        setAuthAttempts(attempts);
      } catch (error) {
        console.error('Error loading auth attempts:', error);
      }
    }
  }, []);

  const saveAttempts = (attempts: Record<string, AuthAttempt>) => {
    localStorage.setItem(ATTEMPT_STORAGE_KEY, JSON.stringify(attempts));
    setAuthAttempts(attempts);
  };

  const recordFailedAttempt = (email: string) => {
    const now = Date.now();
    const currentAttempt = authAttempts[email] || {
      email,
      attempts: 0,
      lastAttempt: now,
      isBlocked: false
    };

    const newAttempt: AuthAttempt = {
      ...currentAttempt,
      attempts: currentAttempt.attempts + 1,
      lastAttempt: now,
      isBlocked: currentAttempt.attempts + 1 >= MAX_ATTEMPTS
    };

    const newAttempts = {
      ...authAttempts,
      [email]: newAttempt
    };

    saveAttempts(newAttempts);
    return newAttempt;
  };

  const clearAttempts = (email: string) => {
    const newAttempts = { ...authAttempts };
    delete newAttempts[email];
    saveAttempts(newAttempts);
  };

  const isEmailBlocked = (email: string): { blocked: boolean; timeLeft?: number } => {
    const attempt = authAttempts[email];
    if (!attempt || !attempt.isBlocked) {
      return { blocked: false };
    }

    const timeElapsed = Date.now() - attempt.lastAttempt;
    const timeLeft = BLOCK_DURATION - timeElapsed;

    if (timeLeft <= 0) {
      // El bloqueo ha expirado, limpiar intentos
      clearAttempts(email);
      return { blocked: false };
    }

    return { blocked: true, timeLeft };
  };

  const getAttemptsLeft = (email: string): number => {
    const attempt = authAttempts[email];
    if (!attempt) return MAX_ATTEMPTS;
    return Math.max(0, MAX_ATTEMPTS - attempt.attempts);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): PasswordValidation => {
    const errors: string[] = [];
    let strength: PasswordValidation['strength'] = 'weak';

    // Longitud mínima
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    // Al menos una mayúscula
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una letra mayúscula');
    }

    // Al menos una minúscula
    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una letra minúscula');
    }

    // Al menos un número
    if (!/\d/.test(password)) {
      errors.push('Debe contener al menos un número');
    }

    // Al menos un caracter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Debe contener al menos un caracter especial (!@#$%^&*...)');
    }

    // Calcular fortaleza
    const criteria = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      password.length >= 12
    ];

    const passedCriteria = criteria.filter(Boolean).length;

    if (passedCriteria <= 2) strength = 'weak';
    else if (passedCriteria <= 3) strength = 'medium';
    else if (passedCriteria <= 4) strength = 'strong';
    else strength = 'very-strong';

    return {
      isValid: errors.length === 0,
      errors,
      strength
    };
  };

  const setRememberMe = (remember: boolean, email?: string) => {
    if (remember && email) {
      localStorage.setItem('remember_email', email);
      localStorage.setItem('remember_me', 'true');
    } else {
      localStorage.removeItem('remember_email');
      localStorage.removeItem('remember_me');
    }
  };

  const getRememberedEmail = (): string | null => {
    const remember = localStorage.getItem('remember_me');
    const email = localStorage.getItem('remember_email');
    return remember === 'true' ? email : null;
  };

  return {
    recordFailedAttempt,
    clearAttempts,
    isEmailBlocked,
    getAttemptsLeft,
    validateEmail,
    validatePassword,
    setRememberMe,
    getRememberedEmail
  };
};