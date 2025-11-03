"use client"

import { useState } from "react"
import { LoginForm } from "@/components/login-form"
import { RegistrationForm } from "@/components/registration-form"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [user, setUser] = useState<{ id: string; email: string; name: string; role: string } | null>(null)

  const handleLogin = (userData: { id: string; email: string; name: string; role: string }) => {
    setUser(userData)
    setIsLoggedIn(true)
  }

  const handleRegisterSuccess = () => {
    setShowRegister(false)
    alert("Registration successful! Please login.")
  }

  if (!isLoggedIn) {
    if (showRegister) {
      return <RegistrationForm onBack={() => setShowRegister(false)} onSuccess={handleRegisterSuccess} />
    }
    return <LoginForm onLogin={handleLogin} onShowRegister={() => setShowRegister(true)} />
  }

  return <Dashboard userRole={user!.role as "admin" | "teacher" | "student"} onLogout={() => { setIsLoggedIn(false); setUser(null) }} />
}
