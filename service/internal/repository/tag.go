package repository

import (
	"tagvis/internal/entities"
)

type TagRepository interface {
	GetAllTag() ([]entities.Tag, error)
	GetTagByTagId(int) (*entities.Tag, error)

	GetAllTagTableData() ([]entities.Tag, error)

	PostAddTag(item *entities.Tag) error

}
