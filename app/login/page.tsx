"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/contexts/UserContext"
import "./styles.css"

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useUser()

  const [step, setStep] = useState<"phone" | "verification" | "details">("phone")
  const [phone, setPhone] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [sentCode, setSentCode] = useState("")
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const normalizePhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/[^0-9]/g, "")

    if (cleaned.startsWith("992") && cleaned.length === 12) {
      cleaned = cleaned.substring(3)
    } else if (cleaned.startsWith("992") && cleaned.length > 9) {
      cleaned = cleaned.substring(3)
    }

    return cleaned.substring(0, 9)
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const normalizedPhone = normalizePhoneNumber(phone)

      console.log("[v0] Normalized phone:", normalizedPhone)

      if (normalizedPhone.length !== 9) {
        setError("Введите корректный номер телефона")
        setLoading(false)
        return
      }

      // Generate and send SMS code
      const code = Math.floor(1000 + Math.random() * 9000).toString()
      setSentCode(code)

      console.log("[v0] Generated code:", code)
      console.log("[v0] Sending SMS to:", normalizedPhone)

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

      console.log("[v0] SMS API response status:", response.status)

      const data = await response.json()

      console.log("[v0] SMS API response data:", data)

      if (data.success) {
        setPhone(normalizedPhone)
        setStep("verification")
      } else {
        setError(data.error || "Ошибка отправки SMS")
      }
    } catch (err) {
      console.error("[v0] Phone submit error:", err)
      setError("Ошибка отправки SMS-кода")
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (verificationCode !== sentCode) {
      setError("Неверный код подтверждения")
      setLoading(false)
      return
    }

    try {
      // Check if user exists in database
      const verifyResponse = await fetch("/api/user/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      })

      const verifyData = await verifyResponse.json()

      if (verifyData.success && verifyData.exists) {
        // User exists with complete data
        const userData = verifyData.user

        // Check if user has name and address
        if (userData.name && userData.address) {
          // Complete registration - go to main page
          setUser(userData)
          router.push("/")
        } else {
          // User exists but incomplete - ask for details
          setStep("details")
        }
      } else {
        // New user - ask for details
        setStep("details")
      }
    } catch (err) {
      console.error("Verification error:", err)
      setError("Ошибка проверки пользователя")
    } finally {
      setLoading(false)
    }
  }

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          address,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        router.push("/")
      } else {
        setError(data.error || "Ошибка регистрации")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("Ошибка регистрации")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-circle">
              <i className="fas fa-utensils"></i>
            </div>
          </div>
          <h1 className="login-title">Cafe SiMin</h1>
          <p className="login-subtitle">
            {step === "phone" && "Введите номер телефона для входа"}
            {step === "verification" && "Введите код подтверждения"}
            {step === "details" && "Расскажите нам о себе"}
          </p>
        </div>

        {step === "phone" && (
          <form onSubmit={handlePhoneSubmit} className="login-form">
            <div className="form-field">
              <label htmlFor="phone" className="form-label">
                Номер телефона
              </label>
              <div className="input-wrapper">
                <i className="fas fa-phone input-icon"></i>
                <span className="phone-prefix">+992</span>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "")
                    setPhone(value.substring(0, 9))
                  }}
                  placeholder="901234567"
                  required
                  className="form-input phone-input"
                  maxLength={9}
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Отправка...
                </>
              ) : (
                <>
                  Продолжить
                  <i className="fas fa-arrow-right"></i>
                </>
              )}
            </button>
          </form>
        )}

        {step === "verification" && (
          <form onSubmit={handleVerificationSubmit} className="login-form">
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
                  placeholder="1234"
                  maxLength={4}
                  required
                  className="form-input code-input"
                  autoFocus
                />
              </div>
              <p className="code-hint">Код отправлен на номер +992{phone}</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="button" onClick={() => setStep("phone")} className="back-btn">
              <i className="fas fa-arrow-left"></i>
              Изменить номер
            </button>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Проверка...
                </>
              ) : (
                <>
                  Подтвердить
                  <i className="fas fa-check"></i>
                </>
              )}
            </button>
          </form>
        )}

        {step === "details" && (
          <form onSubmit={handleDetailsSubmit} className="login-form">
            <div className="form-field">
              <label htmlFor="name" className="form-label">
                Ваше имя
              </label>
              <div className="input-wrapper">
                <i className="fas fa-user input-icon"></i>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введите ваше имя"
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
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Введите адрес"
                  required
                  className="form-input"
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Сохранение...
                </>
              ) : (
                <>
                  Завершить регистрацию
                  <i className="fas fa-check"></i>
                </>
              )}
            </button>
          </form>
        )}

        <div className="login-footer">
          <p className="footer-text">Нажимая "Продолжить", вы соглашаетесь с условиями использования</p>
        </div>
      </div>
    </div>
  )
}
