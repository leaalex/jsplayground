package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID           uint           `gorm:"primarykey" json:"id"`
	Email        string         `gorm:"uniqueIndex;not null" json:"email"`
	Fullname     string         `gorm:"not null;default:''" json:"fullname"`
	PasswordHash string         `gorm:"column:password_hash;not null" json:"-"`
	Role         string         `gorm:"default:student;not null" json:"role"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (User) TableName() string {
	return "users"
}
