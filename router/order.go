package router

import "github.com/gin-gonic/gin"

func initOrder() {
	getOrder()
	delOrder()
	addOrder()
	modifyOrder()
}

func getOrder() {
	orderRouter.GET("", func(context *gin.Context) {
		context.JSON(200, gin.H{
			"Order": "test",
		})
	})
}
func delOrder() {
	orderRouter.DELETE("", func(context *gin.Context) {
		context.JSON(200, gin.H{
			"Order": "test",
		})
	})
}
func addOrder() {
	orderRouter.POST("", func(context *gin.Context) {
		context.JSON(200, gin.H{
			"Order": "test",
		})
	})
}
func modifyOrder() {
	orderRouter.PUT("", func(context *gin.Context) {
		context.JSON(200, gin.H{
			"Order": "test",
		})
	})
}
