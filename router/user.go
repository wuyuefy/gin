package router

import (
	"web/api"
)

func initUser() {
	getUser()
	modifyUser()
	addUser()
	delUser()
}
func getUser() {
	userRouter.GET("", api.GetUser)
}
func delUser() {
	userRouter.DELETE("", api.DelUser)
}
func addUser() {
	userRouter.POST("", api.AddUser)
}
func modifyUser() {
	userRouter.PUT("", api.ModifyUser)
}
