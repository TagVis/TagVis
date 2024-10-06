package service

import (
	"log"
	"strings"
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

func (s tagService) GetTagDataTables() ([]entities.TagDataTablesDataResponse, error) {
	tags, err := s.tagRepo.GetAllTagDataTables()
	if err != nil {
		log.Println(err)
		return nil, err
	}

	tagResponses := []entities.TagDataTablesDataResponse{}
	for _, tag := range tags {
		tagResponse := entities.TagDataTablesDataResponse{
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

func (s tagService) DeleteTagByTagId(tagID int) error {
	_, err := s.GetTagByTagId(tagID)
	if err != nil {
		if strings.Contains(err.Error(), "tag doesn't exist") {
			return fiber.NewError(fiber.StatusNotFound, "tag not found")
		}
		return err
	}

	err = s.tagRepo.DeleteTagByTagId(tagID)
	if err != nil {
		return err
	}

	return nil
}

func (s tagService) DeleteTags() error {
    err := s.tagRepo.DeleteAllTag()
    if err != nil {
        return err
    }
    return nil
}
