package model

type User struct {
	Id         int    `json:"id" gorm:"primary_key;AUTO_INCREMENT"`
	Username   string `json:"username" gorm:"unique" binding:"required" query:"username" form:"username"`
	Password   string `binding:"required" query:"password" form:"password" json:"password" gorm:"not null"`
	LoginTime  string `json:"login_time" gorm:"not null"`
	CreateUNIX int    `json:"create_unix,omitempty" gorm:"type:int(11);not null"`
	UpdateUNIX int    `json:"update_unix,omitempty" gorm:"type:int(11);not null"`
}

func (t User) TableName() string {
	return "user"
}
