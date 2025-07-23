-- Insert sample agency
INSERT INTO agencies (id, name, email, domain, status) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Digital Marketing Pro', 'admin@digitalpro.com', 'digitalpro.com', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert sample clients
INSERT INTO clients (id, agency_id, name, email, contact_phone, industry, status) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'TechCorp Inc.', 'contact@techcorp.com', '+1-555-0101', 'Technology', 'active'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Fashion Boutique', 'info@fashionboutique.com', '+1-555-0102', 'Fashion', 'active'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Local Restaurant', 'hello@localrestaurant.com', '+1-555-0103', 'Food & Beverage', 'active'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Fitness Studio', 'contact@fitnessstudio.com', '+1-555-0104', 'Health & Fitness', 'paused')
ON CONFLICT (id) DO NOTHING;

-- Insert sample branding configuration
INSERT INTO branding_configurations (
    agency_id, 
    logo_url, 
    primary_color, 
    secondary_color, 
    accent_color, 
    background_color, 
    text_color,
    heading_font,
    body_font,
    portal_domain
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'https://via.placeholder.com/200x80/007AFF/FFFFFF?text=Digital+Pro',
    '#007AFF',
    '#34C759',
    '#FF9500',
    '#FFFFFF',
    '#333333',
    'Inter',
    'Inter',
    'portal.digitalpro.com'
)
ON CONFLICT (agency_id) DO NOTHING;

-- Insert sample team members
INSERT INTO team_members (id, agency_id, user_id, name, email, role, permissions, status) VALUES 
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Sarah Johnson', 'sarah@digitalpro.com', 'Account Manager', '{"clients": ["read", "write"], "campaigns": ["read", "write"], "reports": ["read"]}', 'active'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Mike Chen', 'mike@digitalpro.com', 'Creative Director', '{"clients": ["read"], "campaigns": ["read", "write"], "reports": ["read"], "assets": ["read", "write"]}', 'active'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Emily Davis', 'emily@digitalpro.com', 'Social Media Specialist', '{"clients": ["read"], "campaigns": ["read", "write"], "posts": ["read", "write"]}', 'active'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Alex Rodriguez', 'alex@digitalpro.com', 'Analytics Manager', '{"clients": ["read"], "campaigns": ["read"], "reports": ["read", "write"], "analytics": ["read", "write"]}', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample client assignments
INSERT INTO client_assignments (team_member_id, client_id, role) VALUES 
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'Primary Account Manager'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'Primary Account Manager'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Creative Lead'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', 'Creative Lead'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'Social Media Manager'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'Social Media Manager'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', 'Social Media Manager'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'Analytics Specialist'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 'Analytics Specialist')
ON CONFLICT (team_member_id, client_id) DO NOTHING;

-- Insert sample subscription
INSERT INTO subscriptions (
    agency_id, 
    plan_name, 
    plan_type, 
    price_monthly, 
    price_yearly, 
    features, 
    limits,
    status,
    current_period_start,
    current_period_end
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Professional',
    'monthly',
    199.00,
    1990.00,
    '["unlimited_clients", "advanced_analytics", "white_label", "team_collaboration", "api_access"]',
    '{"clients": -1, "team_members": 10, "reports_per_month": 100, "api_calls_per_month": 10000}',
    'active',
    NOW() - INTERVAL '15 days',
    NOW() + INTERVAL '15 days'
)
ON CONFLICT DO NOTHING;

-- Insert sample invoices
INSERT INTO invoices (
    agency_id, 
    client_id, 
    invoice_number, 
    amount, 
    currency, 
    status, 
    due_date, 
    paid_date,
    description,
    line_items
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    'INV-2024-001',
    2500.00,
    'USD',
    'paid',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE - INTERVAL '3 days',
    'Social Media Management - January 2024',
    '[{"description": "Social Media Management", "quantity": 1, "rate": 2000.00, "amount": 2000.00}, {"description": "Content Creation", "quantity": 10, "rate": 50.00, "amount": 500.00}]'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440002',
    'INV-2024-002',
    1800.00,
    'USD',
    'paid',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE - INTERVAL '2 days',
    'Social Media Management - January 2024',
    '[{"description": "Social Media Management", "quantity": 1, "rate": 1500.00, "amount": 1500.00}, {"description": "Photography", "quantity": 6, "rate": 50.00, "amount": 300.00}]'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440003',
    'INV-2024-003',
    1200.00,
    'USD',
    'pending',
    CURRENT_DATE + INTERVAL '10 days',
    NULL,
    'Social Media Management - February 2024',
    '[{"description": "Social Media Management", "quantity": 1, "rate": 1000.00, "amount": 1000.00}, {"description": "Menu Photography", "quantity": 4, "rate": 50.00, "amount": 200.00}]'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440004',
    'INV-2024-004',
    900.00,
    'USD',
    'overdue',
    CURRENT_DATE - INTERVAL '15 days',
    NULL,
    'Social Media Management - January 2024',
    '[{"description": "Social Media Management", "quantity": 1, "rate": 900.00, "amount": 900.00}]'
)
ON CONFLICT (invoice_number) DO NOTHING;

-- Insert sample report templates
INSERT INTO report_templates (
    agency_id,
    name,
    description,
    template_type,
    config,
    is_default
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Monthly Performance Report',
    'Comprehensive monthly performance analysis',
    'monthly_performance',
    '{"sections": ["overview", "metrics", "campaigns", "recommendations"], "charts": ["impressions", "engagements", "conversions"], "branding": true}',
    true
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Weekly Summary',
    'Quick weekly performance summary',
    'weekly_summary',
    '{"sections": ["overview", "metrics"], "charts": ["impressions", "engagements"], "branding": true}',
    false
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Campaign Analysis',
    'Detailed campaign performance analysis',
    'campaign_analysis',
    '{"sections": ["campaign_overview", "performance", "audience", "recommendations"], "charts": ["performance_trend", "audience_breakdown"], "branding": true}',
    false
)
ON CONFLICT DO NOTHING;

-- Insert sample report schedules
INSERT INTO report_schedules (
    agency_id,
    client_id,
    template_id,
    name,
    frequency,
    delivery_method,
    recipients,
    next_run_at,
    status
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM report_templates WHERE name = 'Monthly Performance Report' LIMIT 1),
    'TechCorp Monthly Report',
    'monthly',
    'email',
    '["contact@techcorp.com", "sarah@digitalpro.com"]',
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month',
    'active'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440002',
    (SELECT id FROM report_templates WHERE name = 'Weekly Summary' LIMIT 1),
    'Fashion Boutique Weekly Summary',
    'weekly',
    'both',
    '["info@fashionboutique.com"]',
    DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week',
    'active'
)
ON CONFLICT DO NOTHING;