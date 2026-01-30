/*
  # TrustRail Database Schema
  
  1. New Tables
    - `businesses`
      - `id` (uuid, primary key)
      - `business_name` (text, required)
      - `email` (text, unique, required)
      - `phone` (text, required)
      - `industry` (text, required)
      - `cac_certificate_url` (text, required)
      - `other_documents_urls` (text[], optional)
      - `email_verified` (boolean, default false)
      - `payment_slug` (text, unique)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `payment_rules`
      - `id` (uuid, primary key)
      - `business_id` (uuid, foreign key)
      - `min_order_value` (numeric, default 50000)
      - `max_instalment_period` (integer, default 6)
      - `down_payment_percentage` (integer, default 30)
      - `enable_fees` (boolean, default false)
      - `interest_rate` (numeric, default 0)
      - `late_fee` (numeric, default 0)
      - `auto_approve_threshold` (integer, default 70)
      - `auto_decline_threshold` (integer, default 40)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `business_id` (uuid, foreign key)
      - `customer_name` (text)
      - `amount` (numeric)
      - `status` (text)
      - `created_at` (timestamptz)
    
    - `customers`
      - `id` (uuid, primary key)
      - `business_id` (uuid, foreign key)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `trust_score` (integer)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated businesses to access their own data
*/

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  industry text NOT NULL,
  cac_certificate_url text,
  other_documents_urls text[],
  email_verified boolean DEFAULT false,
  payment_slug text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses can read own data"
  ON businesses FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Businesses can update own data"
  ON businesses FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can insert business data"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create payment_rules table
CREATE TABLE IF NOT EXISTS payment_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  min_order_value numeric DEFAULT 50000,
  max_instalment_period integer DEFAULT 6,
  down_payment_percentage integer DEFAULT 30,
  enable_fees boolean DEFAULT false,
  interest_rate numeric DEFAULT 0,
  late_fee numeric DEFAULT 0,
  auto_approve_threshold integer DEFAULT 70,
  auto_decline_threshold integer DEFAULT 40,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses can read own payment rules"
  ON payment_rules FOR SELECT
  TO authenticated
  USING (business_id = auth.uid());

CREATE POLICY "Businesses can update own payment rules"
  ON payment_rules FOR UPDATE
  TO authenticated
  USING (business_id = auth.uid())
  WITH CHECK (business_id = auth.uid());

CREATE POLICY "Businesses can insert own payment rules"
  ON payment_rules FOR INSERT
  TO authenticated
  WITH CHECK (business_id = auth.uid());

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  customer_name text NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses can read own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (business_id = auth.uid());

CREATE POLICY "Businesses can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (business_id = auth.uid());

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  trust_score integer DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses can read own customers"
  ON customers FOR SELECT
  TO authenticated
  USING (business_id = auth.uid());

CREATE POLICY "Businesses can insert own customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (business_id = auth.uid());

CREATE POLICY "Businesses can update own customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (business_id = auth.uid())
  WITH CHECK (business_id = auth.uid());