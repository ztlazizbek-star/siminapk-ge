"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import "./onboarding.css"

const onboardingSteps = [
  {
    id: 1,
    title: "Добро пожаловать в Кафе Симин",
    description: "Заказывайте любимые блюда онлайн. Быстро, удобно и вкусно. Широкий выбор блюд для всей семьи.",
    image: "/delicious-food-delivery-illustration-yellow-backgr.jpg",
  },
  {
    id: 2,
    title: "Разнообразное меню",
    description:
      "Бургеры, напитки, комбо и многое другое. Свежие ингредиенты и уникальные рецепты. Специальные предложения каждый день.",
    image: "/restaurant-menu-variety-colorful-dishes-yellow-bac.jpg",
  },
  {
    id: 3,
    title: "Быстрая доставка",
    description:
      "Доставим ваш заказ за 15-25 минут. Горячие блюда прямо к вашей двери. Отслеживайте статус заказа в реальном времени.",
    image: "/fast-food-delivery-service-yellow-background.jpg",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right")

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setSlideDirection("right")
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 50)
    } else {
      localStorage.setItem("onboardingCompleted", "true")
      router.push("/login")
    }
  }

  const handleSkip = () => {
    localStorage.setItem("onboardingCompleted", "true")
    router.push("/login")
  }

  const step = onboardingSteps[currentStep]

  return (
    <div className="onboarding-container">
      <div className="onboarding-background" />

      <button className="skip-button" onClick={handleSkip}>
        Пропустить
      </button>

      <div className={`onboarding-content slide-${slideDirection}`} key={currentStep}>
        <div className="onboarding-image-wrapper">
          <img src={step.image || "/placeholder.svg"} alt={step.title} className="onboarding-image" />
        </div>

        <div className="onboarding-text-content">
          <h1 className="onboarding-title">Ознакомьтесь</h1>
          <h2 className="onboarding-subtitle">{step.title}</h2>
          <p className="onboarding-description">{step.description}</p>
        </div>

        <div className="onboarding-dots">
          {onboardingSteps.map((_, index) => (
            <div key={index} className={`dot ${index === currentStep ? "active" : ""}`} />
          ))}
        </div>

        <button className="onboarding-button" onClick={handleNext}>
          {currentStep === onboardingSteps.length - 1 ? "Вход / Регистрация" : "Продолжить"}
        </button>
      </div>
    </div>
  )
}
