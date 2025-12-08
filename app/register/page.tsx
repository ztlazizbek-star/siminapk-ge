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
  const [step, setStep] = useState<"form" | "verification">("form")
  const [verificationCode, setVerificationCode] = useState("")
  const [sentCode, setSentCode] = useState("")

  const normalizePhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/[^0-9]/g, "")

    // If starts with 992 and is 12 digits, strip 992
    if (cleaned.startsWith("992") && cleaned.length === 12) {
      cleaned = cleaned.substring(3)
    }
    // If starts with 992 and is more than 9 digits but not 12, strip 992
    else if (cleaned.startsWith("992") && cleaned.length > 9) {
      cleaned = cleaned.substring(3)
    }

    // Return only first 9 digits
    return cleaned.substring(0, 9)
  }

  const sendSMSCode = async () => {
    setLoading(true)
    setError("")

    try {
      // Generate a random 4-digit code
      const code = Math.floor(1000 + Math.random() * 9000).toString()
      setSentCode(code)

      const normalizedPhone = normalizePhoneNumber(formData.phone)

      console.log("[v0] Sending SMS code:", code, "to phone:", normalizedPhone)

      // Send SMS via API
      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: normalizedPhone,
          code: code,
        }),
      })

      const data = await response.json()
      console.log("[v0] SMS API response:", data)

      if (data.success) {
        setStep("verification")
      } else {
        setError(data.error || "Ошибка отправки SMS")
      }
    } catch (err) {
      console.error("[v0] SMS send error:", err)
      setError("Ошибка отправки SMS-кода")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === "form") {
      // First step: send SMS code
      await sendSMSCode()
    } else {
      // Second step: verify code and register
      await verifyAndRegister()
    }
  }

  const verifyAndRegister = async () => {
    setLoading(true)
    setError("")

    console.log("[v0] Verifying code:", verificationCode, "against:", sentCode)

    if (verificationCode !== sentCode) {
      setError("Неверный код подтверждения")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log("[v0] Registration response:", data)

      if (data.success) {
        setUser(data.user)
        router.push("/")
      } else {
        setError(data.error || "Ошибка регистрации")
      }
    } catch (err) {
      console.error("[v0] Registration error:", err)
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
          <div class="logo-circle">
  <span class="logo-text">Cafe Simin</span>
</div>

          <h1 className="register-title">Добро пожаловать в Cafe Simin</h1>
          <p className="register-subtitle">
            {step === "form"
              ? "Расскажите нам о себе, чтобы мы могли доставить вам вкусную еду"
              : "Введите код подтверждения, отправленный на ваш номер"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {step === "form" ? (
            <>
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
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9+]/g, "")
                      setFormData({ ...formData, phone: value })
                    }}
                    onBlur={(e) => {
                      const normalized = normalizePhoneNumber(e.target.value)
                      setFormData({ ...formData, phone: normalized })
                    }}
                    placeholder="Введите номер телефона"
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
            </>
          ) : (
            <>
              <div className="form-field">
                <label htmlFor="code" className="form-label">
                  Код подтверждения
                </label>
                <div className="input-wrapper">
                  <i className="fas fa-lock input-icon"></i>
                  <input
                    type="text"
                    id="code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Введите 4-значный код"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    required
                    className="form-input"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep("form")}
                className="back-btn"
                style={{
                  marginBottom: "10px",
                  background: "transparent",
                  color: "#ff6b6b",
                  border: "1px solid #ff6b6b",
                }}
              >
                <i className="fas fa-arrow-left"></i>
                Назад
              </button>
            </>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="continue-btn">
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Загрузка...
              </>
            ) : step === "form" ? (
              <>
                Продолжить
                <i className="fas fa-arrow-right"></i>
              </>
            ) : (
              <>
                Подтвердить
                <i className="fas fa-check"></i>
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
