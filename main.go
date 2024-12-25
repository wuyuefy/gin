package main

import (
	"web/router"
	"web/utils"
)

func main() {

	// listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
	err := router.Router.Run(utils.C.App.Port)
	if err != nil {
		return
	}
}
