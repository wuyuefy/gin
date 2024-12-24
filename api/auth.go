package api

import (
	"github.com/gin-gonic/gin"
	"web/database"
	"web/model"
)

func Login(context *gin.Context) {
	user := model.User{}
	err := context.Bind(&user)
	if err != nil {
		println(err)
	}
	getUser := database.GetUser(&user)
	context.JSON(200, getUser)
}
