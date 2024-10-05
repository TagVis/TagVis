package entities

type Tag struct {
	TagID   *uint `gorm:"primaryKey;autoIncrement"`
	PartNO  *string
	PO      *string
	Quntity *uint
}

type TagTableDataDataResponse struct {
	TagID       *uint
	PartNO      *string
	PO          *string
	Quntity     *uint
	SumOfPartNO *uint
}
