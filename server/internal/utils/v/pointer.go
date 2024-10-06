package v

func Ptr[T any](val T) *T {
	return &val
}

func UintPtr(val int) *uint {
	return Ptr(uint(val))
}

func ByteSlice(s *string) []byte {
	if s == nil {
		return nil
	}
	return []byte(*s)
}
