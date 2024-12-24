package router

import "github.com/gin-gonic/gin"

func initGoods() {
	getGoods()
	addGoods()
	delGoods()
	modifyGoods()
}

func getGoods() {
	goodsRouter.GET("", func(context *gin.Context) {
		context.JSON(200, gin.H{
			"goods": "test",
		})
	})
}
func delGoods() {
	goodsRouter.DELETE("", func(context *gin.Context) {
		context.JSON(200, gin.H{
			"goods": "test",
		})
	})
}
func addGoods() {
	goodsRouter.POST("", func(context *gin.Context) {
		context.JSON(200, gin.H{
			"goods": "test",
		})
	})
}
func modifyGoods() {
	goodsRouter.PUT("", func(context *gin.Context) {
		context.JSON(200, gin.H{
			"goods": "test",
		})
	})
}
