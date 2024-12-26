package model

type BaseModel struct {
	CreatedAt int `json:"created_at,omitempty" gorm:"type:int(11);not null"`
	UpdatedAt int `json:"updated_at,omitempty" gorm:"type:int(11);not null"`
}

func (t BaseModel) TableName() string {
	return ""
}
