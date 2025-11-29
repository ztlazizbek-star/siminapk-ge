"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@/app/contexts/UserContext"

interface User {
  name: string
  phone: string
  address: string
  profilePhoto?: string | null
}

interface ProfileModalProps {
  show: boolean
  user: User
  onClose: () => void
  onSave: (user: User) => void
}

export default function ProfileModal({ show, user, onClose, onSave }: ProfileModalProps) {
  const [formData, setFormData] = useState(user)
  const { logout } = useUser()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showLogoutAlert, setShowLogoutAlert] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] ProfileModal: Form submitted")
    console.log("[v0] ProfileModal: Form data:", formData)
    onSave(formData)
  }

  const handleLogout = () => {
    setShowLogoutAlert(true)
  }

  const confirmLogout = () => {
    logout()
    onClose()
    setShowLogoutAlert(false)
  }

  const handleDeleteAccount = () => {
    setShowDeleteAlert(true)
  }

  const confirmDeleteAccount = async () => {
    setIsDeleting(true)
    setShowDeleteAlert(false)

    try {
      console.log("[v0] Deleting account for phone:", user.phone)

      const response = await fetch("/api/user/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: user.phone }),
      })

      console.log("[v0] Delete API response status:", response.status)
      const data = await response.json()
      console.log("[v0] Delete API response data:", data)

      if (data.success) {
        alert("Ваш аккаунт успешно удален")
        logout()
        onClose()
      } else {
        alert("Ошибка при удалении аккаунта: " + (data.error || "Неизвестная ошибка"))
      }
    } catch (error) {
      console.error("[v0] Error deleting account:", error)
      alert("Ошибка при удалении аккаунта: " + (error instanceof Error ? error.message : "Неизвестная ошибка"))
    } finally {
      setIsDeleting(false)
    }
  }

  if (!show) return null

  return (
    <>
      <div className="modal" id="profileModal" style={{ display: "flex" }}>
        <div className="modal-content">
          <span className="close-btn" onClick={onClose}>
            <i className="fas fa-times-circle"></i>
          </span>
          <div className="profile-photo-container">
            {user.profilePhoto ? (
              <img src={`${user.profilePhoto}?v=${Date.now()}`} alt="Profile Photo" className="profile-photo" />
            ) : (
              <i className="fas fa-user-circle profile-photo-icon"></i>
            )}
          </div>
          <h2>Редактировать профиль</h2>
          <form id="profileForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <i className="fas fa-user"></i>
            </div>
            <div className="form-group">
              <input
                type="text"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, "") })}
                maxLength={9}
                pattern="[0-9]{9}"
                required
              />
              <i className="fas fa-phone"></i>
            </div>
            <div className="form-group">
              <input
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
              <i className="fas fa-truck"></i>
            </div>
            <button type="submit" className="submit-btn">
              <i className="fas fa-save"></i> Сохранить
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              <i className="fas fa-times"></i> Отмена
            </button>

            <button type="button" className="logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Выйти из аккаунта
            </button>

            <button type="button" className="delete-account-btn" onClick={handleDeleteAccount} disabled={isDeleting}>
              <i className="fas fa-trash-alt"></i> {isDeleting ? "Удаление..." : "Удалить аккаунт"}
            </button>
          </form>
        </div>
      </div>

      {showLogoutAlert && (
        <div className="ios-alert-overlay" onClick={() => setShowLogoutAlert(false)}>
          <div className="ios-alert" onClick={(e) => e.stopPropagation()}>
            <div className="ios-alert-title">Выйти из аккаунта</div>
            <div className="ios-alert-message">Вы уверены, что хотите выйти?</div>
            <div className="ios-alert-buttons">
              <button className="ios-alert-button ios-alert-button-cancel" onClick={() => setShowLogoutAlert(false)}>
                Отмена
              </button>
              <button className="ios-alert-button ios-alert-button-destructive" onClick={confirmLogout}>
                Выйти
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAlert && (
        <div className="ios-alert-overlay" onClick={() => setShowDeleteAlert(false)}>
          <div className="ios-alert" onClick={(e) => e.stopPropagation()}>
            <div className="ios-alert-title">Удалить аккаунт</div>
            <div className="ios-alert-message">
              Это действие необратимо. Все ваши данные будут полностью удалены из базы данных.
            </div>
            <div className="ios-alert-buttons">
              <button className="ios-alert-button ios-alert-button-cancel" onClick={() => setShowDeleteAlert(false)}>
                Отмена
              </button>
              <button className="ios-alert-button ios-alert-button-destructive" onClick={confirmDeleteAccount}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
