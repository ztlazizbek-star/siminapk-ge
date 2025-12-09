"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/contexts/UserContext"
import "./styles.css"

export default function LoginPage() {
  const router = useRouter()
  const { user, setUser } = useUser()

  const [step, setStep] = useState<"phone" | "verification" | "details">("phone")
  const [phone, setPhone] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [sentCode, setSentCode] = useState("")
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [timeLeft, setTimeLeft] = useState(0) // SMS qayta jo'natish uchun vaqt

  // ✅ 1. Foydalanuvchi kirishini tekshirish
  useEffect(() => {
    // Client-side da ishlashini tekshirish
    if (typeof window !== 'undefined') {
      // Agar foydalanuvchi allaqachon ro'yxatdan o'tgan bo'lsa
      const savedUserData = localStorage.getItem("userData")
      
      if (savedUserData) {
        try {
          const userData = JSON.parse(savedUserData)
          setUser(userData)
          router.push("/") // Asosiy sahifaga
        } catch (error) {
          console.error("Error parsing user data:", error)
          localStorage.removeItem("userData")
        }
        return
      }
      
      // ✅ MUHIM: Agar onboarding ko'rilmagan bo'lsa
      const onboardingCompleted = localStorage.getItem("onboardingCompleted")
      if (onboardingCompleted !== "true") {
        router.push("/onboarding") // Onboarding sahifasiga
      }
    }
  }, [router, setUser])

  // ✅ 2. SMS qayta jo'natish uchun timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const normalizePhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/[^0-9]/g, "")

    if (cleaned.startsWith("992") && cleaned.length === 12) {
      cleaned = cleaned.substring(3)
    } else if (cleaned.startsWith("992") && cleaned.length > 9) {
      cleaned = cleaned.substring(3)
    }

    return cleaned.substring(0, 9)
  }

  // ✅ 3. Telefon raqamini tekshirish va SMS yuborish
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const normalizedPhone = normalizePhoneNumber(phone)

      console.log("[Login] Normalized phone:", normalizedPhone)

      if (normalizedPhone.length !== 9) {
        setError("Введите корректный номер телефона (9 цифр)")
        setLoading(false)
        return
      }

      // Generate and send SMS code
      const code = Math.floor(1000 + Math.random() * 9000).toString()
      setSentCode(code)
      setTimeLeft(60) // 60 soniya timer boshlash

      console.log("[Login] Generated code:", code)
      console.log("[Login] Sending SMS to:", normalizedPhone)

      // Real API chaqiruvi
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

      console.log("[Login] SMS API response status:", response.status)

      const data = await response.json()

      console.log("[Login] SMS API response data:", data)

      if (data.success) {
        setPhone(normalizedPhone)
        setStep("verification")
      } else {
        setError(data.error || "Ошибка отправки SMS")
      }
    } catch (err) {
      console.error("[Login] Phone submit error:", err)
      setError("Ошибка отправки SMS-кода. Проверьте подключение к интернету.")
    } finally {
      setLoading(false)
    }
  }

  // ✅ 4. SMS kodni qayta jo'natish
  const handleResendCode = async () => {
    if (timeLeft > 0) return

    setLoading(true)
    setError("")

    try {
      const code = Math.floor(1000 + Math.random() * 9000).toString()
      setSentCode(code)
      setTimeLeft(60)

      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone,
          code: code,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setError("Новый код отправлен")
      } else {
        setError(data.error || "Ошибка отправки SMS")
      }
    } catch (err) {
      console.error("[Login] Resend error:", err)
      setError("Ошибка отправки SMS")
    } finally {
      setLoading(false)
    }
  }

  // ✅ 5. SMS kodni tasdiqlash
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
          // ✅ Onboarding ni ham true qilamiz
          localStorage.setItem("onboardingCompleted", "true")
          localStorage.setItem("userData", JSON.stringify(userData))
          router.push("/")
        } else {
          // User exists but incomplete - ask for details
          setStep("details")
          // Agar ism allaqachon mavjud bo'lsa, to'ldiramiz
          if (userData.name) setName(userData.name)
          if (userData.address) setAddress(userData.address)
        }
      } else {
        // New user - ask for details
        setStep("details")
      }
    } catch (err) {
      console.error("[Login] Verification error:", err)
      setError("Ошибка проверки пользователя")
    } finally {
      setLoading(false)
    }
  }

  // ✅ 6. Ma'lumotlarni saqlash
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!name.trim() || !address.trim()) {
      setError("Заполните все поля")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phone,
          address: address.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        // ✅ Onboarding tugaganligini belgilash
        localStorage.setItem("onboardingCompleted", "true")
        localStorage.setItem("userData", JSON.stringify(data.user))
        router.push("/")
      } else {
        setError(data.error || "Ошибка регистрации")
      }
    } catch (err) {
      console.error("[Login] Registration error:", err)
      setError("Ошибка регистрации. Проверьте подключение к интернету.")
    } finally {
      setLoading(false)
    }
  }

  // ✅ 7. Telefon raqamini o'zgartirish
  const handleChangePhone = () => {
    setStep("phone")
    setVerificationCode("")
    setSentCode("")
    setTimeLeft(0)
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-circle">
              <i className="fas fa-user"></i>
            </div>
          </div>
          <h1 className="login-title">
            {step === "phone" ? "Регистрация" : 
             step === "verification" ? "Подтверждение" : 
             "Завершение регистрации"}
          </h1>
          <p className="login-subtitle">
            {step === "phone" && "Введите свой номер телефона — мы поможем войти или создать аккаунт"}
            {step === "verification" && "Введите код подтверждения из SMS"}
            {step === "details" && "Расскажите нам о себе"}
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {step === "phone" && (
          <form onSubmit={handlePhoneSubmit} className="login-form">
            <div className="form-field">
              <label htmlFor="phone" className="form-label">
                Номер телефона
              </label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Flag_of_Tajikistan.svg" 
                    alt="Tajikistan flag" 
                    width="24" 
                    height="16"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
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
                  disabled={loading}
                />
              </div>
              <p className="phone-hint">Введите 9 цифр без кода страны</p>
            </div>

            <button type="submit" disabled={loading || phone.length !== 9} className="submit-btn">
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Отправка...
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
                  disabled={loading}
                />
              </div>
              <p className="code-hint">Код отправлен на номер +992{phone}</p>
              
              <div className="resend-container">
                {timeLeft > 0 ? (
                  <span className="resend-timer">
                    Запросить новый код через {timeLeft} сек
                  </span>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleResendCode} 
                    className="resend-btn"
                    disabled={loading}
                  >
                    <i className="fas fa-redo"></i>
                    Отправить код повторно
                  </button>
                )}
              </div>
            </div>

            <div className="button-group">
              <button type="button" onClick={handleChangePhone} className="back-btn" disabled={loading}>
                <i className="fas fa-arrow-left"></i>
                Изменить номер
              </button>

              <button type="submit" disabled={loading || verificationCode.length !== 4} className="submit-btn">
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
            </div>
          </form>
        )}

        {step === "details" && (
          <form onSubmit={handleDetailsSubmit} className="login-form">
            <div className="form-field">
              <label htmlFor="name" className="form-label">
                Ваше имя *
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
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="address" className="form-label">
                Адрес доставки *
              </label>
              <div className="input-wrapper">
                <i className="fas fa-map-marker-alt input-icon"></i>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Введите адрес для доставки"
                  required
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="button-group">
              <button type="button" onClick={handleChangePhone} className="back-btn" disabled={loading}>
                <i className="fas fa-arrow-left"></i>
                Изменить номер
              </button>

              <button type="submit" disabled={loading || !name.trim() || !address.trim()} className="submit-btn">
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
            </div>
          </form>
        )}

        <div className="login-footer">
          <p className="footer-text">
            Нажимая "Продолжить", вы соглашаетесь с{' '}
            <a href="/terms" className="footer-link">Условиями использования</a>
            {' '}и{' '}
            <a href="/privacy" className="footer-link">Политикой конфиденциальности</a>
          </p>
        </div>
      </div>
    </div>
  )
}
