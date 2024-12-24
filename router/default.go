package router

import (
	"github.com/gin-gonic/gin"
	"web/middleware"
)

var authRouter *gin.RouterGroup
var userRouter *gin.RouterGroup
var orderRouter *gin.RouterGroup
var goodsRouter *gin.RouterGroup

var Router *gin.Engine

func init() {

	Router = gin.Default()
	Router.Use(middleware.Auth)
	authRouter = Router.Group("auth")
	userRouter = Router.Group("user")
	orderRouter = Router.Group("order")
	goodsRouter = Router.Group("goods")
	load()
}

func load() {
	initAuth()
	initGoods()
	initOrder()
	initUser()
}
