"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/contexts/UserContext"
import "./styles.css"

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useUser()

  const [step, setStep] = useState<"phone" | "code" | "details">("phone")
  const [phone, setPhone] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [sentCode, setSentCode] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showConfirmAlert, setShowConfirmAlert] = useState(false)

  const normalizePhoneNumber = (phoneInput: string): string => {
    let cleaned = phoneInput.replace(/[^0-9]/g, "")
    if (cleaned.startsWith("992") && cleaned.length === 12) {
      cleaned = cleaned.substring(3)
    } else if (cleaned.startsWith("992") && cleaned.length > 9) {
      cleaned = cleaned.substring(3)
    }
    return cleaned.substring(0, 9)
  }

  const formatPhoneForDisplay = (phoneInput: string): string => {
    const normalized = normalizePhoneNumber(phoneInput)
    if (normalized.length >= 2) {
      return `+992 ${normalized.slice(0, 2)} ${normalized.slice(2, 5)} ${normalized.slice(5, 7)} ${normalized.slice(7, 9)}`.trim()
    }
    return `+992 ${normalized}`
  }

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length >= 9) {
      setShowConfirmAlert(true)
    }
  }

  const handleConfirmYes = async () => {
    setShowConfirmAlert(false)
    await sendSMSCode()
  }

  const handleConfirmNo = () => {
    setShowConfirmAlert(false)
  }

  const sendSMSCode = async () => {
    setLoading(true)
    setError("")

    try {
      const code = Math.floor(1000 + Math.random() * 9000).toString()
      setSentCode(code)
      const normalized = normalizePhoneNumber(phone)

      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized, code }),
      })

      const data = await response.json()

      if (data.success) {
        setStep("code")
      } else {
        setError(data.error || "Ошибка отправки SMS")
      }
    } catch (err) {
      setError("Ошибка отправки SMS-кода")
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (verificationCode !== sentCode) {
      setError("Неверный код подтверждения")
      const codeInput = document.getElementById("code-input")
      if (codeInput) {
        codeInput.classList.add("shake-error")
        setTimeout(() => codeInput.classList.remove("shake-error"), 500)
      }
      setLoading(false)
      return
    }

    try {
      const normalized = normalizePhoneNumber(phone)

      const response = await fetch("/api/user/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized }),
      })

      const data = await response.json()

      if (data.success && data.exists) {
        setUser(data.user)
        router.push("/")
      } else {
        setStep("details")
      }
    } catch (err) {
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
      const normalized = normalizePhoneNumber(phone)
      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalized,
          name: formData.name,
          address: formData.address,
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
      setError("Ошибка подключения к серверу")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      {showConfirmAlert && (
        <div className="alert-overlay">
          <div className="alert-box">
            <h3 className="alert-title">Подтверждение номера</h3>
            <p className="alert-message">Ваш номер: {formatPhoneForDisplay(phone)}. Всё верно?</p>
            <div className="alert-buttons">
              <button className="alert-btn alert-btn-no" onClick={handleConfirmNo}>
                Нет
              </button>
              <button className="alert-btn alert-btn-yes" onClick={handleConfirmYes}>
                Да
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="register-container">
        <div className="register-header">
          <div className="register-logo">
            <div className="logo-circle">
              <i className="fas fa-utensils"></i>
            </div>
          </div>
          <h1 className="register-title">
            {step === "phone" && "Добро пожаловать"}
            {step === "code" && "Введите код"}
            {step === "details" && "Расскажите о себе"}
          </h1>
          <p className="register-subtitle">
            {step === "phone" && "Введите номер телефона для продолжения"}
            {step === "code" && `Код отправлен на ${formatPhoneForDisplay(phone)}`}
            {step === "details" && "Заполните данные для завершения регистрации"}
          </p>
        </div>

        {step === "phone" && (
          <form onSubmit={handlePhoneSubmit} className="register-form">
            <div className="form-field">
              <label htmlFor="phone" className="form-label">
                Номер телефона
              </label>
              <div className="input-wrapper">
                <i className="fas fa-phone input-icon"></i>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9+]/g, "")
                    setPhone(value)
                  }}
                  placeholder="+992 XX XXX XX XX"
                  required
                  className="form-input"
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading || phone.length < 9} className="continue-btn">
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Загрузка...
                </>
              ) : (
                <>
                  Получить код
                  <i className="fas fa-arrow-right"></i>
                </>
              )}
            </button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleCodeSubmit} className="register-form">
            <div className="form-field">
              <label htmlFor="code-input" className="form-label">
                Код подтверждения
              </label>
              <div className="input-wrapper">
                <i className="fas fa-lock input-icon"></i>
                <input
                  type="text"
                  id="code-input"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Введите 4-значный код"
                  maxLength={4}
                  required
                  className="form-input"
                  autoFocus
                />
              </div>
            </div>

            {error && <div className="error-message error-shake">{error}</div>}

            <button type="button" onClick={() => setStep("phone")} className="back-btn">
              <i className="fas fa-arrow-left"></i>
              Назад
            </button>

            <button type="submit" disabled={loading || verificationCode.length < 4} className="continue-btn">
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Загрузка...
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
          <form onSubmit={handleDetailsSubmit} className="register-form">
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
                  Сохранить и войти
                  <i className="fas fa-check"></i>
                </>
              )}
            </button>
          </form>
        )}

        <div className="register-footer">
          <p className="footer-text">
            Нажимая кнопку, вы соглашаетесь с нашими условиями использования и политикой конфиденциальности
          </p>
        </div>
      </div>
    </div>
  )
}
