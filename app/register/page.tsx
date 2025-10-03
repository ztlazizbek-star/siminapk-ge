"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/contexts/UserContext"
import "./styles.css"

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useUser()
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        router.push("/")
      } else {
        setError(data.error || "Ошибка регистрации")
      }
    } catch (err) {
      setError("Ошибка подключения к серверу")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <div className="register-logo">
            <div className="logo-circle">
              <i className="fas fa-utensils"></i>
            </div>
          </div>
          <h1 className="register-title">Добро пожаловать в Cafe Simin</h1>
          <p className="register-subtitle">Расскажите нам о себе, чтобы мы могли доставить вам вкусную еду</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-field">
            <label htmlFor="name" className="form-label">
              Ваше имя
            </label>
            <div className="input-wrapper">
              <i className="fas fa-user input-icon"></i>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Введите ваше имя"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="phone" className="form-label">
              Номер телефона
            </label>
            <div className="input-wrapper">
              <i className="fas fa-phone input-icon"></i>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, "") })}
                placeholder="Введите номер телефона"
                maxLength={9}
                pattern="[0-9]{9}"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="address" className="form-label">
              Адрес доставки
            </label>
            <div className="input-wrapper">
              <i className="fas fa-map-marker-alt input-icon"></i>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Введите адрес доставки"
                required
                className="form-input"
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="continue-btn">
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Загрузка...
              </>
            ) : (
              <>
                Продолжить
                <i className="fas fa-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        <div className="register-footer">
          <p className="footer-text">
            Нажимая "Продолжить", вы соглашаетесь с нашими условиями использования и политикой конфиденциальности
          </p>
        </div>
      </div>
    </div>
  )
}
