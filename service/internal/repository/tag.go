package repository

import (
	"tagvis/internal/entities"
)

type TagRepository interface {
	GetAllTag() ([]entities.Tag, error)
	GetTagByTagId(int) (*entities.Tag, error)

	GetAllTagDataTables() ([]entities.Tag, error)

	PostAddTag(item *entities.Tag) error

}
