package database

import "web/model"

func GetUser(user *model.User) (result model.User) {
	recover()
	tx := db.Where(&user).Find(&result)
	println(tx)
	return
}
