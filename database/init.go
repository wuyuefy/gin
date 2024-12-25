package database

import (
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"web/utils"
)

var db *gorm.DB
var err error

func init() {
	db, err = gorm.Open(mysql.Open(utils.GetDns()), &gorm.Config{
		QueryFields: true,
	})
	if err != nil {
		fmt.Printf("connect database error: %s\n", err)
	}
	s, err := db.DB()
	if err != nil {
		fmt.Printf("connect db error: %s\n", err)
	}
	s.SetMaxIdleConns(10)
	s.SetMaxOpenConns(20)
}
