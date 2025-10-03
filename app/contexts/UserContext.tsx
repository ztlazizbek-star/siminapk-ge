"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  name: string
  phone: string
  address: string
  profilePhoto: string | null
}

interface UserContextType {
  user: User | null
  isRegistered: boolean
  isLoading: boolean
  setUser: (user: User) => void
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const savedUser = localStorage.getItem("cafe_user")

      if (savedUser) {
        const userData = JSON.parse(savedUser)

        // Проверяем существует ли пользователь в базе данных
        try {
          const response = await fetch("/api/user/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ phone: userData.phone }),
          })

          const data = await response.json()

          if (data.success && data.exists) {
            // Пользователь существует в БД, обновляем данные
            setUserState(data.user)
            setIsRegistered(true)
            localStorage.setItem("cafe_user", JSON.stringify(data.user))
          } else {
            // Пользователя нет в БД, очищаем localStorage
            localStorage.removeItem("cafe_user")
            setUserState(null)
            setIsRegistered(false)
          }
        } catch (error) {
          console.error("Error verifying user:", error)
          // В случае ошибки используем данные из localStorage
          setUserState(userData)
          setIsRegistered(true)
        }
      }

      setIsLoading(false)
    }

    checkUser()
  }, [])

  const setUser = (newUser: User) => {
    setUserState(newUser)
    setIsRegistered(true)
    localStorage.setItem("cafe_user", JSON.stringify(newUser))
  }

  const logout = () => {
    setUserState(null)
    setIsRegistered(false)
    localStorage.removeItem("cafe_user")
    localStorage.removeItem("cart")
  }

  return (
    <UserContext.Provider value={{ user, isRegistered, isLoading, setUser, logout }}>{children}</UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
