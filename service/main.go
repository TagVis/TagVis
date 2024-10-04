package main

import (
	"fmt"

	"log"
	"needful/internal/entities"
	"needful/internal/handler"
	"needful/internal/repository"
	"needful/internal/service"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"

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

	tagService := service.NewUserService(tagRepositoryDB)

	tagHandler := handler.NewMessageHandler(tagService)

	app := fiber.New()

	app.Use(func(c *fiber.Ctx) error {
		return "idk"
	})

	//Endpoint ###########################################################################

	// Endpoint for test
	app.Get("/GetUsers", userHandler.GetUsers)
	app.Get("/GetUserByUserId/:UserID", userHandler.GetUserByUserId)
	// Endpoint for project
	app.Post("/Register", userHandler.Register)

	//#####################################################################################

	log.Printf("TagVis running at port:  %v", viper.GetInt("app.port"))
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
