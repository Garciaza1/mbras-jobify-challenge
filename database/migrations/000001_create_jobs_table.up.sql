CREATE TABLE IF NOT EXISTS jobs (
    job_id BIGINT PRIMARY KEY,
    title VARCHAR(255),
    company_name VARCHAR(255),
    candidate_required_location VARCHAR(255),
    description TEXT,
    job_type VARCHAR(50),
    category VARCHAR(50),
    publication_date VARCHAR(50),
    url TEXT,
    tags TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);