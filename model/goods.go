package model

type Goods struct {
	Id         int    `json:"id,omitempty" gorm:"primary_key;AUTO_INCREMENT"`
	Asin       string `json:"asin,omitempty" gorm:"type:varchar(10);not null"`
	Price      int    `json:"price,omitempty" gorm:"type:int(11);not null"`
	Url        string `json:"url,omitempty" gorm:"type:varchar(255);not null"`
	Store      string `json:"store,omitempty" gorm:"type:varchar(255);not null"`
	CreateUNIX int    `json:"create_unix,omitempty" gorm:"type:int(11);not null"`
	UpdateUNIX int    `json:"update_unix,omitempty" gorm:"type:int(11);not null"`
}

func (t Goods) TableName() string {
	return "goods"
}
