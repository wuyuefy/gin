package utils

import (
	"github.com/golang-jwt/jwt/v5"
	"time"
)

var secretKey = []byte("v2~!F~s-U0s#K?f6tT2p")

type JwtToken struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func GenerateToken(username string) (token string, err error) {
	setClaims := JwtToken{
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		},
	}
	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, setClaims)
	token, err = claims.SignedString(secretKey)
	if err != nil {
		println(err)
	}
	println(token)
	return
}
func ParseToken(token string) (jwtToken *JwtToken) {
	claims, err := jwt.ParseWithClaims(token, &JwtToken{}, func(token *jwt.Token) (interface{}, error) {
		return secretKey, nil
	})
	if err != nil {
		println(err)
	}
	jwtToken = claims.Claims.(*JwtToken)
	return
}
