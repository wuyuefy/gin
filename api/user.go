package api

import (
	"github.com/gin-gonic/gin"
	"web/database"
	"web/model"
)

func GetUser(context *gin.Context) {
	user := model.User{}
	err := context.Bind(&user)
	if err != nil {
		println(err)
	}
	database.GetUser(&user)
	context.JSON(200, user)
}
func DelUser(context *gin.Context) {
	user := model.User{}
	err := context.Bind(&user)
	if err != nil {
		println(err)
	}
	database.GetUser(&user)
	context.JSON(200, user)
}
func AddUser(context *gin.Context) {
	user := model.User{}
	err := context.Bind(&user)
	if err != nil {
		println(err)
	}
	database.GetUser(&user)
	context.JSON(200, user)
}
func ModifyUser(context *gin.Context) {
	user := model.User{}
	err := context.Bind(&user)
	if err != nil {
		println(err)
	}
	database.GetUser(&user)
	context.JSON(200, user)
}
