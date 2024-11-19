package contextkeys

type Key string

const UserIDKey = Key("userID")

type contextKey string

const ConnPoolKey contextKey = "connPool"
