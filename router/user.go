package router

import (
	"web/api"
)

func initUser() {
	postUser()
	deleteUser()
	getUser()
	putUser()
}
func getUser() {
	userRouter.GET("", api.GetUser)
}
func deleteUser() {
	userRouter.DELETE("", api.DeleteUser)
}
func postUser() {
	userRouter.POST("", api.PostUser)
}
func putUser() {
	userRouter.PUT("", api.PutUser)
}
