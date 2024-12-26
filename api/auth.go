package api

import (
	"github.com/gin-gonic/gin"
	"web/database"
	"web/model"
	"web/utils"
)

func Login(context *gin.Context) {
	query := model.User{}
	err := context.Bind(&query)
	if err != nil {
		println(err)
	}
	user := database.FindUser(&query)
	if user.Username == "" {
		fail(context, 100, "用户名密码错误")
		return
	}
	token, err := utils.GenerateToken(user.Username)
	if err != nil {
		fail(context, 100, "解析token出现错误")
		return
	} else {
		success(context, gin.H{"accessToken": token})
	}
}
func Info(context *gin.Context) {
	success(context, gin.H{
		"roles":    []string{"admin"},
		"realName": "admin",
	})
}
