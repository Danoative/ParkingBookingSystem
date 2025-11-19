-- Use only for quick local test if you already have a hash
INSERT INTO users (username, FullName, LastName, email, PasswordHash, address, role)
VALUES ('testuser','Test User','User','testuser@example.com',
        '$2a$10$1f2g3h4i5j6k7l8m9n0oOuQf2g6Qe5SxG3nQ2hVQkD7y1lQh1E7iG', -- example only; replace with real hash
        '123 Test Street','CUSTOMER');
-- Insert Admin 
INSERT INTO users (username, FullName, LastName, email, PasswordHash, address, role)
VALUES ('admin','Test User','User','admin@example.com',
        '$2a$10$1f2g3h4i5j6k7l8m9n0oOuQf2g6Qe5SxG3nQ2hVQkD7y1lQh1E7iG', -- example only; replace with real hash
        '123 Test Street','Admin');