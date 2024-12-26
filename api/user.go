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
	database.FindUser(&user)
	context.JSON(200, user)
}
func PostUser(context *gin.Context) {
	user := model.User{}
	err := context.Bind(&user)
	if err != nil {
		println(err)
	}
	database.CreateUser(&user)
	context.JSON(200, user)
}
func DeleteUser(context *gin.Context) {
	user := model.User{}
	err := context.Bind(&user)
	if err != nil {
		println(err)
	}
	database.DeleteUser(&user)
	context.JSON(200, user)
}
func PutUser(context *gin.Context) {
	user := model.User{}
	err := context.Bind(&user)
	if err != nil {
		println(err)
	}
	database.UpdateUser(&user)
	context.JSON(200, user)
}
