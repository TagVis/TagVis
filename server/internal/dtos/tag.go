package dtos

type TagDataResponse struct {
	TagID    *uint   `json:"tag_id" validate:"required"`
	PartNO   *string `json:"part_no" validate:"required"`
	PO       *string `json:"po" validate:"required"`
	Quantity *uint   `json:"quantity" validate:"required"`
}

type TagDataByTagIdResponse struct {
	TagID    *uint   `json:"tag_id" validate:"required"`
	PartNO   *string `json:"part_no" validate:"required"`
	PO       *string `json:"po" validate:"required"`
	Quantity *uint   `json:"quantity" validate:"required"`
}

type TagDataTablesDataResponse struct {
	TagID       *uint   `json:"tag_id" validate:"required"`
	PartNO      *string `json:"part_no" validate:"required"`
	PO          *string `json:"po" validate:"required"`
	Quantity    *uint   `json:"quantity" validate:"required"`
}

type AddTagRequest struct {
	PartNO   *string `json:"part_no" validate:"required"`
	PO       *string `json:"po" validate:"required"`
	Quantity *uint   `json:"quantity" validate:"required"`
}
