"use client"

interface SuccessModalProps {
  onClose: () => void
}

export default function SuccessModal({ onClose }: SuccessModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="40" fill="#4CAF50" />
            <path d="M25 40L35 50L55 30" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 className="success-title">Заказ успешно оформлен!</h2>
        <p className="success-message">
          Ваш заказ принят в обработку. Мы свяжемся с вами в ближайшее время для подтверждения.
        </p>

        <button className="success-btn" onClick={onClose}>
          Вернуться в меню
        </button>
      </div>
    </div>
  )
}
