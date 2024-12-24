package api

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"web/database"
	"web/model"
	"web/utils"
)

func Login(context *gin.Context) {
	user := model.User{}
	err := context.Bind(&user)
	if err != nil {
		println(err)
	}
	getUser := database.GetUser(&user)
	token, err := utils.GenerateToken(getUser.Username)
	if err != nil {
		context.JSON(http.StatusOK, gin.H{
			"err": err.Error(),
		})
	} else {
		context.JSON(200, gin.H{
			"data":    gin.H{"accessToken": token},
			"code":    0,
			"message": "",
		})
	}
}
