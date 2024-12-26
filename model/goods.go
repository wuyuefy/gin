package model

type Goods struct {
	Id        int    `json:"id,omitempty" gorm:"primary_key;AUTO_INCREMENT"`
	Asin      string `json:"asin,omitempty" gorm:"type:varchar(10);not null"`
	Price     int    `json:"price,omitempty" gorm:"type:int(11);not null"`
	Url       string `json:"url,omitempty" gorm:"type:varchar(255);not null"`
	Store     string `json:"store,omitempty" gorm:"type:varchar(255);not null"`
	CreatedAt int    `json:"created-at,omitempty" gorm:"type:int(11);not null"`
	UpdatedAt int    `json:"updated_at,omitempty" gorm:"type:int(11);not null"`
}

func (t Goods) TableName() string {
	return "goods"
}
