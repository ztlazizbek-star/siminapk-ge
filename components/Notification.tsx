interface NotificationProps {
  show: boolean
  message: string
  type: "success" | "error" | ""
}

export default function Notification({ show, message, type }: NotificationProps) {
  if (!show) return null

  return (
    <div className={`notification ${type} ${show ? "show" : ""}`} id="notification">
      {message}
    </div>
  )
}
