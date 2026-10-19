# Exam Platform

Fullstack Laravel / Astro-Remix exam platform with MySQL + MongoDB.

## Quick Start

```bash
docker-compose up -d --build
docker exec exam_php php artisan migrate --force
docker exec exam_php php artisan app:check-connections
docker exec exam_php php artisan test
```

**Local:** http://localhost:8080

## Services

| Service | Container      | Port  |
|---------|----------------|-------|
| Nginx   | exam_nginx     | 8080  |
| PHP-FPM | exam_php       | 9000  |
| MySQL 8 | exam_mysql     | 3307  |
| Mongo 7 | exam_mongo     | 27018 |
