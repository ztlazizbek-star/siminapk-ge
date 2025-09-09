"use client"

interface User {
  name: string
  address: string
  profilePhoto?: string | null
}

interface HeaderProps {
  user: User
  onProfileClick: () => void
}

export default function Header({ user, onProfileClick }: HeaderProps) {
  return (
    <header className="header">
      <div className="location">
        <i className="fas fa-map-marker-alt"></i>
        <div className="location-content">
          <span className="location-text">{user.address}</span>
          <span className="delivery-time">Доставка около 15 минут</span>
        </div>
      </div>
      <div className="profile" onClick={onProfileClick}>
        {user.profilePhoto ? (
          <img
            src={`${user.profilePhoto}?v=${Date.now()}`}
            alt="Profile Photo"
            onError={(e) => {
              e.currentTarget.style.display = "none"
              e.currentTarget.nextElementSibling?.setAttribute("style", "display: inline-block")
            }}
          />
        ) : (
          <i className="fas fa-user-circle"></i>
        )}
        <span className="profile-text">{user.name}</span>
      </div>
    </header>
  )
}
