package router

import "web/api"

func initAuth() {
	login()
	info()
}
func login() {
	authRouter.POST("login", api.Login)
}
func info() {
	authRouter.GET("info", api.Info)
}
