package middleware

import (
	"github.com/gin-gonic/gin"
	"strings"
	"web/utils"
)

func Auth(context *gin.Context) {
	uri := context.Request.RequestURI
	whileUri := map[string]bool{
		"/auth/login": true,
	}
	b := whileUri[uri]
	if !b {
		auth := "authorization"
		authorization := context.Request.Header.Get(auth)
		replace := strings.Replace(authorization, "Bearer ", "", 1)
		token := utils.ParseToken(replace)
		if token.Username == "" {
			context.Abort()
		}
	}
}
