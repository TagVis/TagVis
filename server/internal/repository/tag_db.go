package repository

import (
	"tagvis/internal/entities"

	"gorm.io/gorm"
)

type tagRepositoryDB struct {
	db *gorm.DB
}

func NewTagRepositoryDB(db *gorm.DB) tagRepositoryDB {
	return tagRepositoryDB{db: db}
}

func (r tagRepositoryDB) GetAllTag() ([]entities.Tag, error) {
	tags := []entities.Tag{}
	result := r.db.Find(&tags)
	if result.Error != nil {
		return nil, result.Error
	}
	return tags, nil
}

func (r tagRepositoryDB) GetTagByTagId(tagid int) (*entities.Tag, error) {
	tags := entities.Tag{}
	result := r.db.Where("tag_id = ?",tagid).Find(&tags)
	if result.Error != nil {
		return nil, result.Error
	}
	return &tags, nil
}

func (r tagRepositoryDB) GetAllTagDataTables() ([]entities.Tag, error) {
	tags := []entities.Tag{}
 	result := r.db.Model(&entities.Tag{}).
	Select("tag_id, part_no, po, SUM(quantity) as quantity").
 	Group("po, part_no").
	Having("po IS NOT NULL").
	Order("part_no IS NULL, part_no ASC").
	Find(&tags)
	if result.Error != nil {
	return nil, result.Error
	}
	return tags, nil
}

func (r tagRepositoryDB) PostAddTag(tag *entities.Tag) error {
	result := r.db.Create(tag)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (r tagRepositoryDB) DeleteTagByTagId(tagid int) error {
	tags := entities.Tag{}
	result := r.db.Where("tag_id = ?", tagid).Unscoped().Delete(&tags)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (r tagRepositoryDB) DeleteAllTag() error {
    result := r.db.Unscoped().Where("1 = 1").Delete(&entities.Tag{})
    if result.Error != nil {
        return result.Error
    }
    return nil
}
