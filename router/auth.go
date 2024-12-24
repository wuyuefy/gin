package router

import "web/api"

func initAuth() {
	login()
}
func login() {
	authRouter.POST("login", api.Login)
}
