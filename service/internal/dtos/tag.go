package dtos

type TagDataResponse struct {
	TagID       *uint   `json:"tag_id" validate:"required"`
	PartNO      *string `json:"part_no" validate:"required"`
	PO          *string `json:"po" validate:"required"`
	Quntity     *uint   `json:"quntity" validate:"required"`
}

type TagDataByTagIdResponse struct {
	TagID       *uint   `json:"tag_id" validate:"required"`
	PartNO      *string `json:"part_no" validate:"required"`
	PO          *string `json:"po" validate:"required"`
	Quntity     *uint   `json:"quntity" validate:"required"`
}

type TagTableDataDataResponse struct {
	TagID       *uint   `json:"tag_id" validate:"required"`
	PartNO      *string `json:"part_no" validate:"required"`
	PO          *string `json:"po" validate:"required"`
	Quntity     *uint   `json:"quntity" validate:"required"`
	SumOfPartNO *uint   `json:"sum_of_part_no" validate:"required"`
}

type AddTagRequest struct {
	PartNO      *string `json:"part_no" validate:"required"`
	PO          *string `json:"po" validate:"required"`
	Quntity     *uint   `json:"quntity" validate:"required"`
}
