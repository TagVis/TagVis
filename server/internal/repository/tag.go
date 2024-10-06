package repository

import (
	"tagvis/internal/entities"
)

type TagRepository interface {
	GetAllTag() ([]entities.Tag, error)
	GetTagByTagId(int) (*entities.Tag, error)

	GetAllTagDataTables() ([]entities.Tag, error)

	PostAddTag(tag *entities.Tag) error

	DeleteTagByTagId(tagID int) error

	DeleteAllTag() error

}
