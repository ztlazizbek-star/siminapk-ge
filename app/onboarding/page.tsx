"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import "./onboarding.css"

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding")
    if (hasSeenOnboarding) {
      router.push("/register")
    }
  }, [router])

  const steps = [
    {
      image: "/onboarding-1.png",
      title: "Добро пожаловать в Cafe Simin",
      description: "Закажите любимые блюда с доставкой прямо к вашей двери за 15-25 минут",
    },
    {
      image: "/onboarding-2.png",
      title: "Широкий выбор блюд",
      description: "Выбирайте из большого ассортимента блюд и напитков. Всё всегда свежее и вкусное",
    },
    {
      image: "/onboarding-3.png",
      title: "Быстрая доставка",
      description: "Доставка по городу Пенджикент всего за 10 сомон. Или закажите самовывоз бесплатно",
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      localStorage.setItem("hasSeenOnboarding", "true")
      router.push("/register")
    }
  }

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true")
    router.push("/register")
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-background"></div>

      <button className="skip-button" onClick={handleSkip}>
        Пропустить
      </button>

      <div className="onboarding-content">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`onboarding-slide ${index === currentStep ? "active" : index < currentStep ? "prev" : "next"}`}
          >
            <div className="onboarding-image-container">
              <img src={step.image || "/placeholder.svg"} alt={step.title} className="onboarding-image" />
            </div>
          </div>
        ))}
      </div>

      <div className="onboarding-info">
        <h1 className="onboarding-title">{steps[currentStep].title}</h1>
        <p className="onboarding-description">{steps[currentStep].description}</p>
      </div>

      <div className="onboarding-controls">
        <div className="onboarding-dots">
          {steps.map((_, index) => (
            <div key={index} className={`dot ${index === currentStep ? "active" : ""}`} />
          ))}
        </div>

        <button className="onboarding-button" onClick={handleNext}>
          {currentStep === steps.length - 1 ? "Вход/Регистрация" : "Продолжить"}
        </button>
      </div>
    </div>
  )
}
