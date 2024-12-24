package main

import (
	"web/router"
)

func main() {

	// listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
	err := router.Router.Run(":8000")
	if err != nil {
		return
	}
}
