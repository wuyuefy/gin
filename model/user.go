package model

type User struct {
	Id        int    `json:"id" gorm:"primary_key;AUTO_INCREMENT"`
	Username  string `json:"username" gorm:"unique" binding:"required" query:"username" form:"username"`
	Password  string `binding:"required" query:"password" form:"password" json:"password" gorm:"not null"`
	LoginTime string `json:"login_time" gorm:"not null"`
	BaseModel
}

func (t User) TableName() string {
	return "user"
}
