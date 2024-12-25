package api

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func success(content *gin.Context, data interface{}) {
	content.JSON(http.StatusOK, gin.H{
		"data":    data,
		"code":    0,
		"message": "",
	})
}
func fail(content *gin.Context, code int, err string) {
	content.JSON(http.StatusOK, gin.H{
		"code":  code,
		"error": err,
	})
}
