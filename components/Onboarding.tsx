"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import "./onboarding.css"

const onboardingSteps = [
  {
    id: 1,
    title: "Добро пожаловать в Cafe Simin",
    description: "Закажите вкусную еду с доставкой прямо на дом. Быстро, удобно и всегда свежее!",
    image: "/delicious-food-delivery-welcome.jpg",
  },
  {
    id: 2,
    title: "Широкий выбор блюд",
    description:
      "Выбирайте из множества категорий: бургеры, пицца, напитки и многое другое. Найдите идеальное блюдо для себя!",
    image: "/variety-of-food-menu-selection.jpg",
  },
  {
    id: 3,
    title: "Быстрая доставка",
    description: "Мы доставим ваш заказ в течение 15-25 минут. Наслаждайтесь горячей и свежей едой!",
    image: "/fast-food-delivery-service.jpg",
  },
]

export default function Onboarding() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right")

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setSlideDirection("left")
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setSlideDirection("right")
      }, 300)
    }
  }

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("onboarding_completed", "true")
    }
    router.push("/register")
  }

  const handleGetStarted = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("onboarding_completed", "true")
    }
    router.push("/register")
  }

  const step = onboardingSteps[currentStep]
  const isLastStep = currentStep === onboardingSteps.length - 1

  return (
    <div className="onboarding-container">
      {/* Background with blur effect */}
      <div className="onboarding-background" />

      {/* Skip button */}
      {!isLastStep && (
        <button className="skip-button" onClick={handleSkip}>
          Пропустить
        </button>
      )}

      {/* Content */}
      <div className="onboarding-content">
        {/* Title */}
        <h1 className="onboarding-title">{step.title}</h1>

        {/* Image */}
        <div className={`onboarding-image-container slide-${slideDirection}`}>
          <img src={step.image || "/placeholder.svg"} alt={step.title} className="onboarding-image" />
        </div>

        {/* Description with blur background */}
        <div className="onboarding-description-container">
          <p className="onboarding-description">{step.description}</p>
        </div>

        {/* Progress dots */}
        <div className="onboarding-dots">
          {onboardingSteps.map((_, index) => (
            <div key={index} className={`dot ${index === currentStep ? "active" : ""}`} />
          ))}
        </div>

        {/* Action button */}
        <button className="onboarding-button" onClick={isLastStep ? handleGetStarted : handleNext}>
          {isLastStep ? (
            <>
              <i className="fas fa-sign-in-alt"></i>
              Вход/Регистрация
            </>
          ) : (
            <>
              Продолжить
              <i className="fas fa-arrow-right"></i>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
