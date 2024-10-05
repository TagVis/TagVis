package handler

import (
	"github.com/gofiber/fiber/v2"
	"tagvis/internal/dtos"
	"tagvis/internal/service"
	"strconv"
)

type tagHandler struct {
	tagSer   service.TagService
}

func NewTagHandler(tagSer service.TagService) tagHandler {
	return tagHandler{tagSer: tagSer}
}

func (h *tagHandler) GetTags(c *fiber.Ctx) error {
	tagsResponse := make([]dtos.TagDataResponse, 0)

	tags, err := h.tagSer.GetTags()
	if err != nil {
		return err
	}

	for _, tag := range tags {
		tagsResponse = append(tagsResponse, dtos.TagDataResponse{
			TagID:   tag.TagID,
			PartNO:  tag.PartNO,
			PO:      tag.PO,
			Quantity: tag.Quantity,
		})
	}
	return c.JSON(tagsResponse)
}

func (h *tagHandler) GetTagByTagId(c *fiber.Ctx) error {
	tagIDReceive, err := strconv.Atoi(c.Params("TagID"))

	tag, err := h.tagSer.GetTagByTagId(tagIDReceive)
	if err != nil {
		return err
	}

	tagResponse := dtos.TagDataByTagIdResponse{
		TagID:   tag.TagID,
		PartNO:  tag.PartNO,
		PO:      tag.PO,
		Quantity: tag.Quantity,
	}

	return c.JSON(tagResponse)
}

func (h *tagHandler) GetTagDataTables(c *fiber.Ctx) error {
	tagsResponse := make([]dtos.TagDataTablesDataResponse, 0)

	tags, err := h.tagSer.GetTagDataTables()
	if err != nil {
		return err
	}

	for _, tag := range tags {
		tagsResponse = append(tagsResponse, dtos.TagDataTablesDataResponse{
			TagID:   tag.TagID,
			PartNO:  tag.PartNO,
			PO:      tag.PO,
			Quantity: tag.Quantity,
		})
	}
	return c.JSON(tagsResponse)
}

func (h *tagHandler) PostAddTag(c *fiber.Ctx) error {

	var request dtos.AddTagRequest
	if err := c.BodyParser(&request); err != nil {
		return err
	}

	tag, err := h.tagSer.PostAddTag(request)
	if err != nil {
		return err
	}

	tagResponse := dtos.AddTagRequest{
		PartNO:  tag.PartNO,
		PO:      tag.PO,
		Quantity: tag.Quantity,
	}

	return c.JSON(tagResponse)
}

