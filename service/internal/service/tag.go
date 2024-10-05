package service

import (
	"tagvis/internal/dtos"
	"tagvis/internal/entities"
)

type TagService interface {
	GetTags() ([]entities.Tag, error)
	GetTagByTagId(int) (*entities.Tag, error)

	GetTagTableData() ([]entities.Tag, error)

	PostAddTag(dtos.AddTagRequest) (*entities.Tag, error)

}
