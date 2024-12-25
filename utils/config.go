package utils

import (
	"fmt"
	"gopkg.in/yaml.v3"
	"os"
)

type Config struct {
	Mysql  Mysql  `yaml:"mysql"`
	Logger Logger `yaml:"logger"`
	App    App    `yaml:"app"`
}
type Mysql struct {
	User    string `yaml:"user,omitempty"`
	Pass    string `yaml:"pass,omitempty"`
	Host    string `yaml:"host,omitempty"`
	Port    string `yaml:"port,omitempty"`
	DB      string `yaml:"db,omitempty"`
	Charset string `yaml:"charset,omitempty"`
}
type App struct {
	Port string `yaml:"port"`
}
type Logger struct{}

var C = Config{}

func init() {
	env := os.Getenv("pro")
	if env == "" {
		env = "dev"
	}
	file, err := os.ReadFile(fmt.Sprintf("./config/config-%s.yaml", env))
	if err != nil {
		fmt.Printf("读取配置文件出现异常: %s\n", err.Error())
		return
	}
	if err = yaml.Unmarshal(file, &C); err != nil {
		fmt.Printf("解析 yaml 出现异常: %s\n", err.Error())
		return
	}
}

func GetDns() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=%s&parseTime=True&loc=Local", C.Mysql.User, C.Mysql.Pass, C.Mysql.Host, C.Mysql.Port, C.Mysql.DB, C.Mysql.Charset)

}
