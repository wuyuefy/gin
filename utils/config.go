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
	Db      string `yaml:"db,omitempty"`
	Charset string `yaml:"charset,omitempty"`
}
type App struct {
	Port string `yaml:"port"`
}
type Logger struct{}

//var C = Config{}

func init() {
	c := Config{}
	env := os.Getenv("pro")
	if env == "" {
		env = "dev"
	}
	file, err := os.ReadFile(fmt.Sprintf("../config/config-%s.yaml", env))
	if err != nil {
		fmt.Printf("读取配置文件出现异常: %s\n", err.Error())
		return
	}
	if err = yaml.Unmarshal(file, &c); err != nil {
		fmt.Printf("解析 yaml 出现异常: %s\n", err.Error())
		return
	}
	fmt.Printf("%s", c)
}

func test() {
	fmt.Printf("%s", "abc")
}
