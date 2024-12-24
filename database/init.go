package database

import (
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var db *gorm.DB
var err error

func init() {
	dns := "root:123@tcp(192.168.2.100:3306)/store_manage?charset=utf8mb4&parseTime=True&loc=Local"
	db, err = gorm.Open(mysql.Open(dns), &gorm.Config{
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
