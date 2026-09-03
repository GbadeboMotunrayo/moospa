-- Spa services: the price list shown on the storefront's Spa page.
-- Run this in the Supabase SQL editor (project sdbvghoaqpuemjoxkzwp).
-- Edit prices anytime from the admin panel's "Spa Prices" tab instead of
-- coming back here — this file only needs to run once to create the table.
-- Idempotent: safe to re-run on a DB that already has the table.

CREATE TABLE IF NOT EXISTS spa_services (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  category    TEXT NOT NULL DEFAULT 'Massage',
  duration    TEXT NOT NULL DEFAULT '60 min',
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  image       TEXT NOT NULL DEFAULT '',
  popular     BOOLEAN NOT NULL DEFAULT FALSE,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO spa_services (name, category, duration, price, description, image, popular) VALUES
  ('Relaxation Massage',    'Massage',  '60 min', 30000, 'A full-body Swedish massage that melts away tension and stress using warm oils and long, flowing strokes.', 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop', TRUE),
  ('Hot Stone Massage',     'Massage',  '90 min', 60000, 'Heated basalt stones placed on key energy points while therapist massages muscles with warm oil. Deeply therapeutic.', 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&h=400&fit=crop', TRUE),
  ('Aromatherapy Massage',  'Massage',  '60 min', 60000, 'Essential oil blends chosen for your mood: relaxation, energy, or romance. A truly sensory experience.', 'https://images.unsplash.com/photo-1608196840522-33f1b59e4ced?w=600&h=400&fit=crop', FALSE),
  ('Deep Tissue Massage',   'Massage',  '75 min', 40000, 'Targets deeper layers of muscle and connective tissue. Ideal for chronic pain, knots, and muscle tightness.', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop', FALSE),
  ('Waist to Head Massage', 'Massage',  '60 min', 20000, 'A full upper-body massage from waist to head, easing tension across the back, shoulders, neck and scalp.', 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop', FALSE),
  ('Luxury Facial',         'Facial',   '60 min', 30000, 'A customized facial using premium products: cleanse, exfoliate, steam, mask, and moisturize for glowing skin.', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop', TRUE),
  ('Collagen Facial',       'Facial',   '60 min', 20000, 'A collagen-infused facial that boosts skin elasticity and firmness, leaving your face plump, smooth and youthful.', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop', FALSE),
  ('Brightening Facial',    'Facial',   '45 min', 7000,  'Targets hyperpigmentation and dull skin with Vitamin C infused treatments and a brightening enzyme mask.', 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=400&fit=crop', FALSE),
  ('Exfoliating Body Scrub','Treatment','45 min', 30000, 'A full-body exfoliation that sloughs away dead skin and buffs away dullness, leaving skin soft, smooth and glowing.', 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop', FALSE),
  ('Moroccan Body Scrub',   'Treatment','60 min', 50000, 'A traditional Moroccan-style scrub using natural black soap and exfoliating gloves to deeply cleanse and renew the skin.', 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop', FALSE),
  ('Basic Pedicure',        'Nails',    '45 min', 10000, 'A classic pedicure: soak, nail shaping, cuticle care and polish for clean, well-groomed feet.', 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=400&fit=crop', FALSE),
  ('Jelly Pedicure',        'Nails',    '60 min', 25000, 'A luxurious jelly-soak pedicure that softens and hydrates the feet before shaping, cuticle care and polish.', 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=400&fit=crop', FALSE),
  ('Manicure',              'Nails',    '30 min', 5000,  'A classic manicure: nail shaping, cuticle care and polish for neat, healthy-looking hands.', 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=400&fit=crop', FALSE),
  ('Couples Spa Package',   'Package',  '120 min',100000,'For two. Side-by-side massage, facial, and champagne service in our private couples suite. Unforgettable.', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop', TRUE)
ON CONFLICT (name) DO NOTHING;
