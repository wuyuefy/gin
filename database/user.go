package database

import "web/model"

func GetUser(user *model.User) (result model.User) {
	db.Where(&user).Find(&result)
	return
}
