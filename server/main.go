package main

import (
	"fmt"
	"log"
	"strings"
	"tagvis/internal/entities"
	"tagvis/internal/handler"
	"tagvis/internal/repository"
	"tagvis/internal/service"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/spf13/viper"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	initTimeZone()
	initConfig()
	dsn := fmt.Sprintf("%v:%v@tcp(%v:%v)/%v?parseTime=true",
		viper.GetString("db.username"),
		viper.GetString("db.password"),
		viper.GetString("db.host"),
		viper.GetInt("db.port"),
		viper.GetString("db.database"),
	)
	log.Println(dsn)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect database")
	}

	err = db.AutoMigrate(&entities.Tag{})
	if err != nil {
		panic("Failed to AutoMigrate Tag")
	}

	tagRepositoryDB := repository.NewTagRepositoryDB(db)
	tagService := service.NewTagService(tagRepositoryDB)
	tagHandler := handler.NewTagHandler(tagService)

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:6340",
		AllowHeaders: "Origin, Content-Type, Accept",
		AllowMethods: "GET, POST, DELETE, OPTIONS",
	}))

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "success",
			"message": "Backend is working, Nei test it",
		})
	})

	app.Get("/GetTags", tagHandler.GetTags)
	app.Get("/GetTagByTagId/:TagID", tagHandler.GetTagByTagId)
	app.Get("/GetTagDataTables", tagHandler.GetTagDataTables)
	app.Post("/PostAddTag", tagHandler.PostAddTag)
	app.Delete("/DeleteTagByTagId/:TagID", tagHandler.DeleteTagByTagId)
	app.Delete("/DeleteTags", tagHandler.DeleteTags)

	log.Printf("TagVis running at port: %v", viper.GetInt("app.port"))
	app.Listen(fmt.Sprintf(":%v", viper.GetInt("app.port")))
}

func initConfig() {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	err := viper.ReadInConfig()
	if err != nil {
		panic(err)
	}
}

func initTimeZone() {
	ict, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		panic(err)
	}
	time.Local = ict
}
