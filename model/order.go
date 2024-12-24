package model

type Order struct {
	Id         int    `json:"id,omitempty" gorm:"primary_key;AUTO_INCREMENT"`
	OrderNo    string `json:"order_no,omitempty" gorm:"type:varchar(255);unique_index"`
	Price      int    `json:"price,omitempty" gorm:"type:decimal(4,2); not null"`
	Status     int    `json:"status,omitempty" gorm:"type:TINYINT"`
	CreateUNIX int    `json:"create_unix,omitempty" gorm:"type:int(11);not null"`
	UpdateUNIX int    `json:"update_unix,omitempty" gorm:"type:int(11);not null"`
}

func (t Order) TableName() string {
	return "order"
}
