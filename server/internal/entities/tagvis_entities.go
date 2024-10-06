package entities

type Tag struct {
	TagID    *uint `gorm:"primaryKey;autoIncrement"`
	PartNO   *string
	PO       *string
	Quantity *uint
}

type TagDataTablesDataResponse struct {
	TagID       *uint
	PartNO      *string
	PO          *string
	Quantity    *uint
}
