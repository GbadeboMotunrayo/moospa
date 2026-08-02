-- Dispatch zones: per-LGA delivery pricing for Lagos (Jazzy Burger style)
-- plus per-state interstate pricing (GIG Logistics-style, category 'Outside Lagos').
-- Run this in the Supabase SQL editor (project sdbvghoaqpuemjoxkzwp).
-- Prices are starter defaults — Lagos tiers by distance from the store (Abule Egba /
-- Ifako-Ijaiye), interstate tiers from GIGL's published 0-2kg Lagos-origin rates.
-- Edit them anytime from the admin panel's "Dispatch Prices" tab.
-- Idempotent: safe to re-run on a DB that already has the table.

CREATE TABLE IF NOT EXISTS dispatch_zones (
  id         SERIAL PRIMARY KEY,
  lga        TEXT NOT NULL UNIQUE,
  price      NUMERIC(10,2) NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  category   TEXT NOT NULL DEFAULT 'Lagos',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dispatch_zones ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Lagos';

INSERT INTO dispatch_zones (lga, price) VALUES
  ('Agege',              2000),
  ('Ajeromi-Ifelodun',   4500),
  ('Alimosho',           2500),
  ('Amuwo-Odofin',       5000),
  ('Apapa',              5000),
  ('Badagry',            7000),
  ('Epe',                8000),
  ('Eti-Osa',            6000),
  ('Ibeju-Lekki',        8000),
  ('Ifako-Ijaiye',       2000),
  ('Ikeja',              3000),
  ('Ikorodu',            5500),
  ('Kosofe',             4000),
  ('Lagos Island',       5000),
  ('Lagos Mainland',     4500),
  ('Mushin',             3500),
  ('Ojo',                4500),
  ('Oshodi-Isolo',       3500),
  ('Shomolu',            4000),
  ('Surulere',           4000)
ON CONFLICT (lga) DO NOTHING;

-- Outside Lagos: one row per state, shipped via courier (GIGL-style rates,
-- small parcel 0-2kg incl. home delivery). Grouped by distance tier.
INSERT INTO dispatch_zones (lga, price, category) VALUES
  ('Ogun',            5000, 'Outside Lagos'),
  ('Oyo',             5500, 'Outside Lagos'),
  ('Osun',            6000, 'Outside Lagos'),
  ('Ondo',            6000, 'Outside Lagos'),
  ('Ekiti',           6500, 'Outside Lagos'),
  ('Kwara',           6500, 'Outside Lagos'),
  ('Edo',             6500, 'Outside Lagos'),
  ('Delta',           7000, 'Outside Lagos'),
  ('Kogi',            7000, 'Outside Lagos'),
  ('Abuja (FCT)',     7500, 'Outside Lagos'),
  ('Niger',           7500, 'Outside Lagos'),
  ('Anambra',         7500, 'Outside Lagos'),
  ('Enugu',           8000, 'Outside Lagos'),
  ('Imo',             8000, 'Outside Lagos'),
  ('Abia',            8000, 'Outside Lagos'),
  ('Rivers',          8000, 'Outside Lagos'),
  ('Akwa Ibom',       8000, 'Outside Lagos'),
  ('Benue',           8000, 'Outside Lagos'),
  ('Nasarawa',        8000, 'Outside Lagos'),
  ('Bayelsa',         8500, 'Outside Lagos'),
  ('Cross River',     8500, 'Outside Lagos'),
  ('Ebonyi',          8500, 'Outside Lagos'),
  ('Kaduna',          8500, 'Outside Lagos'),
  ('Plateau',         8500, 'Outside Lagos'),
  ('Kano',            9000, 'Outside Lagos'),
  ('Bauchi',          9000, 'Outside Lagos'),
  ('Katsina',         9500, 'Outside Lagos'),
  ('Jigawa',          9500, 'Outside Lagos'),
  ('Kebbi',           9500, 'Outside Lagos'),
  ('Sokoto',          9500, 'Outside Lagos'),
  ('Zamfara',         9500, 'Outside Lagos'),
  ('Gombe',           9500, 'Outside Lagos'),
  ('Adamawa',        10000, 'Outside Lagos'),
  ('Taraba',         10000, 'Outside Lagos'),
  ('Borno',          10500, 'Outside Lagos'),
  ('Yobe',           10500, 'Outside Lagos')
ON CONFLICT (lga) DO NOTHING;
