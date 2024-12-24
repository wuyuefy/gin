package utils

import (
	"encoding/json"
	"fmt"
	"testing"
)

func TestAuth(t *testing.T) {
	token, _ := GenerateToken("admin")
	println(token)
}
func TestParseToken(t *testing.T) {
	token := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNzM0ODk3NjM2fQ.jiiy3DpWrX9Mzr1rdV-SQg0QfPOVO5dlKA2AwMU9XMs"
	parseToken := ParseToken(token)
	jsonByte, err := json.Marshal(parseToken)
	if err != nil {
		println(err)
	}
	fmt.Println(string(jsonByte))
}
