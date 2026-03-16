package config

import "os"

func getEnvOrDefault(key, defaultVal string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultVal
}

type Config struct {
	JWTSecret     string
	DBPath        string
	Port          string
	AdminEmail    string
	AdminPassword string
	AdminFullname string
}

func Load() *Config {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "dev-secret-change-in-production"
	}
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "playground.db"
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	return &Config{
		JWTSecret:    jwtSecret,
		DBPath:       dbPath,
		Port:          port,
		AdminEmail:    os.Getenv("ADMIN_EMAIL"),
		AdminPassword: os.Getenv("ADMIN_PASSWORD"),
		AdminFullname: getEnvOrDefault("ADMIN_FULLNAME", "Admin"),
	}
}
