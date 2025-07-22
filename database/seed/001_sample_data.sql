-- Sample data for Urgent Studio

-- Sample users (password: 'password123' - in a real app, use proper hashing)
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@urgentstudio.com', '$2a$10$xVCf4Uu5Ye5VeqB3PXGqQOaWbZBLPRrxjCpYGZUy5oNKwXgFegZVa', 'Admin User', 'admin'),
('designer@urgentstudio.com', '$2a$10$xVCf4Uu5Ye5VeqB3PXGqQOaWbZBLPRrxjCpYGZUy5oNKwXgFegZVa', 'Designer User', 'designer'),
('client@example.com', '$2a$10$xVCf4Uu5Ye5VeqB3PXGqQOaWbZBLPRrxjCpYGZUy5oNKwXgFegZVa', 'Client User', 'client');

-- Sample services
INSERT INTO services (name, description, price, duration_hours) VALUES
('Logo Design', 'Professional logo design service', 500000, 24),
('Website Design', 'Custom website design service', 2000000, 72),
('UI/UX Design', 'User interface and experience design', 1500000, 48),
('Brand Identity', 'Complete brand identity package', 3000000, 120);

-- Sample projects
INSERT INTO projects (title, description, client_id, status) VALUES
('E-commerce Website Redesign', 'Redesign of an existing e-commerce website', (SELECT id FROM users WHERE email = 'client@example.com'), 'in_progress'),
('Corporate Brand Identity', 'New brand identity for a corporate client', (SELECT id FROM users WHERE email = 'client@example.com'), 'draft');

-- Sample bookings
INSERT INTO bookings (user_id, service_id, project_id, booking_date, status, notes) VALUES
((SELECT id FROM users WHERE email = 'client@example.com'), 
 (SELECT id FROM services WHERE name = 'Website Design'),
 (SELECT id FROM projects WHERE title = 'E-commerce Website Redesign'),
 (CURRENT_TIMESTAMP + INTERVAL '2 days'),
 'confirmed',
 'Client prefers minimalist design approach');