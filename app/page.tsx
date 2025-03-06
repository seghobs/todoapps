"use client"

import { useEffect, useState } from "react"
import { TodoApp } from "@/app/components/Todo"
import { authService } from "@/app/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster, toast } from "sonner"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        await authService.getProfile()
        setIsAuthenticated(true)
      }
    } catch (error) {
      localStorage.removeItem("token")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isRegistering) {
        await authService.register(formData.email, formData.username, formData.password)
        toast.success("Kayıt başarılı! Giriş yapabilirsiniz.")
        setIsRegistering(false)
      } else {
        await authService.login(formData.username, formData.password)
        setIsAuthenticated(true)
        toast.success("Giriş başarılı!")
      }
    } catch (error) {
      toast.error(isRegistering ? "Kayıt başarısız!" : "Giriş başarısız!")
    }
  }

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    toast.success("Çıkış yapıldı!")
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Yükleniyor...</div>
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen p-8 flex justify-center items-center">
        <Toaster position="top-center" />
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {isRegistering ? "Kayıt Ol" : "Giriş Yap"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <Input
                  type="email"
                  placeholder="E-posta"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              )}
              <Input
                placeholder="Kullanıcı adı"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
              <Input
                type="password"
                placeholder="Şifre"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              <Button type="submit" className="w-full">
                {isRegistering ? "Kayıt Ol" : "Giriş Yap"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering
                  ? "Zaten hesabınız var mı? Giriş yapın"
                  : "Hesabınız yok mu? Kayıt olun"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <Toaster position="top-center" />
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={handleLogout}>
          Çıkış Yap
        </Button>
      </div>
      <TodoApp />
    </main>
  )
}
