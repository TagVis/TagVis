package entities

type Tag struct {
	TagID    *uint `gorm:"primaryKey;autoIncrement"`
	PartNO   *string
	PO       *string
	Quantity *uint
}

type TagTableDataDataResponse struct {
	TagID       *uint
	PartNO      *string
	PO          *string
	Quantity    *uint
}
