"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import "./onboarding.css"

const onboardingSteps = [
  {
    image: "https://tajstore.ru/simin/file/photo/692a001fb11d5_1764360223.png",
    title: "Добро пожаловать в Cafe Simin",
    description: "Закажите вкусную еду с доставкой прямо к вашему порогу. Быстро, удобно и всегда свежее!",
  },
  {
    image: "/variety-of-restaurant-menu.jpg",
    title: "Широкий выбор блюд",
    description: "Бургеры, напитки, комбо и многое другое. Найдите то, что понравится именно вам!",
  },
  {
    image: "/fast-food-delivery-service.jpg",
    title: "Готовы начать?",
    description: "Зарегистрируйтесь за минуту и получите доступ ко всем возможностям приложения",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right")

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setSlideDirection("right")
      setCurrentStep(currentStep + 1)
    } else {
      // Last step - go to registration
      if (typeof window !== "undefined") {
        localStorage.setItem("onboarding_completed", "true")
      }
      router.push("/register")
    }
  }

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("onboarding_completed", "true")
    }
    router.push("/register")
  }

  const isLastStep = currentStep === onboardingSteps.length - 1

  return (
    <div className="onboarding-page">
      {!isLastStep && (
        <button className="skip-button" onClick={handleSkip}>
          Пропустить
        </button>
      )}

      <div className="onboarding-image-container">
        <div className={`onboarding-image-wrapper slide-${slideDirection}`} key={currentStep}>
          <img
            src={onboardingSteps[currentStep].image || "/placeholder.svg"}
            alt={onboardingSteps[currentStep].title}
            className="onboarding-image"
          />
        </div>
      </div>

      <div className="onboarding-content">
        <div className="onboarding-text">
          <h1 className="onboarding-title">{onboardingSteps[currentStep].title}</h1>
          <p className="onboarding-description">{onboardingSteps[currentStep].description}</p>
        </div>

        <div className="onboarding-indicators">
          {onboardingSteps.map((_, index) => (
            <div key={index} className={`indicator ${index === currentStep ? "active" : ""}`} />
          ))}
        </div>

        <button className="onboarding-button" onClick={handleNext}>
          {isLastStep ? "Войти / Зарегистрироваться" : "Далее"}
          {!isLastStep && <i className="fas fa-arrow-right"></i>}
        </button>
      </div>
    </div>
  )
}
