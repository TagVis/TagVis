package service

import (
	"tagvis/internal/dtos"
	"tagvis/internal/entities"
)

type TagService interface {
	GetTags() ([]entities.Tag, error)
	GetTagByTagId(int) (*entities.Tag, error)

	GetTagDataTables() ([]entities.TagDataTablesDataResponse, error)

	PostAddTag(dtos.AddTagRequest) (*entities.Tag, error)

	DeleteTagByTagId(tagID int) error

	DeleteTags() error

}
