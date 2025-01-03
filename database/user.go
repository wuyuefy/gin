package database

import "web/model"

func FindUser(user *model.User) (result model.User) {
	db.Where(&user).Find(&result)
	return
}
func CreateUser(user *model.User) (result model.User) {
	db.Create(&user)
	return
}
func UpdateUser(user *model.User) (result model.User) {
	db.Where(&user).Updates(&result)
	return
}
func DeleteUser(user *model.User) (result model.User) {
	db.Delete(&user)
	return
}

func FindUUser2Sql(user *model.User) (result model.User) {
	db.Raw("select * from user where id = ?", user.Id).Scan(&result)
	return
}
