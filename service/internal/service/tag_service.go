package service

import (
	"log"
	"tagvis/internal/dtos"
	"tagvis/internal/entities"
	"tagvis/internal/repository"

	"github.com/gofiber/fiber/v2"
)

type tagService struct {
	tagRepo repository.TagRepository
}

func NewTagService(tagRepo repository.TagRepository) tagService {
	return tagService{tagRepo: tagRepo}
}

func (s tagService) GetTags() ([]entities.Tag, error) {
	tags, err := s.tagRepo.GetAllTag()
	if err != nil {
		log.Println(err)
		return nil, err
	}

	tagResponses := []entities.Tag{}
	for _, tag := range tags {
		tagResponse := entities.Tag{
			TagID:   tag.TagID,
			PartNO:  tag.PartNO,
			PO:      tag.PO,
			Quantity: tag.Quantity,
		}
		tagResponses = append(tagResponses, tagResponse)
	}
	return tagResponses, nil
}

func (s tagService) GetTagByTagId(tagid int) (*entities.Tag, error) {
	tag, err := s.tagRepo.GetTagByTagId(tagid)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	if *tag == (entities.Tag{}) {
		return nil, fiber.NewError(fiber.StatusNotFound, "tag doesn't exist")
	}

	tagResponse := entities.Tag{
		TagID:   tag.TagID,
		PartNO:  tag.PartNO,
		PO:      tag.PO,
		Quantity: tag.Quantity,
	}
	return &tagResponse, nil
}

func (s tagService) GetTagTableData() ([]entities.TagTableDataDataResponse, error) {
	tags, err := s.tagRepo.GetAllTagTableData()
	if err != nil {
		log.Println(err)
		return nil, err
	}

	tagResponses := []entities.TagTableDataDataResponse{}
	for _, tag := range tags {
		tagResponse := entities.TagTableDataDataResponse{
			TagID:   tag.TagID,
			PartNO:  tag.PartNO,
			PO:      tag.PO,
			Quantity: tag.Quantity,
		}
		tagResponses = append(tagResponses, tagResponse)
	}
	return tagResponses, nil
}


func (s tagService) PostAddTag(req dtos.AddTagRequest) (*entities.Tag, error) {
    tag := &entities.Tag{
        PartNO:  req.PartNO,
        PO:      req.PO,
        Quantity: req.Quantity,
    }

    err := s.tagRepo.PostAddTag(tag)
    if err != nil {
        log.Println(err)
        return nil, err
    }

    return tag, nil
}
