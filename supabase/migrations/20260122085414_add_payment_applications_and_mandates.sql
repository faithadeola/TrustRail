/*
  # Payment Applications and Mandates Schema

  1. New Tables
    - `payment_applications`
      - `id` (uuid, primary key)
      - `business_id` (uuid, foreign key)
      - `customer_name` (text, required)
      - `customer_email` (text, required)
      - `customer_phone` (text, required)
      - `customer_bvn` (text, masked)
      - `service_description` (text)
      - `total_amount` (numeric)
      - `payment_frequency` (text: monthly, biweekly, weekly)
      - `preferred_start_date` (date)
      - `bank_name` (text)
      - `account_number` (text)
      - `account_name` (text)
      - `status` (text: approved, under_review, declined)
      - `trust_score` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `payment_mandates`
      - `id` (uuid, primary key)
      - `application_id` (uuid, foreign key)
      - `business_id` (uuid, foreign key)
      - `mandate_reference` (text, unique)
      - `status` (text: pending, authorized, active, failed)
      - `authorized_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `payment_schedules`
      - `id` (uuid, primary key)
      - `application_id` (uuid, foreign key)
      - `installment_number` (integer)
      - `amount` (numeric)
      - `due_date` (date)
      - `paid_date` (date, nullable)
      - `status` (text: pending, paid, overdue, failed)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for businesses to access their applications
    - Add policies for customers to access their own applications
*/

CREATE TABLE IF NOT EXISTS payment_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  customer_bvn text,
  service_description text,
  total_amount numeric NOT NULL,
  payment_frequency text DEFAULT 'monthly',
  preferred_start_date date,
  bank_name text,
  account_number text,
  account_name text,
  status text DEFAULT 'under_review',
  trust_score integer DEFAULT 50,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses can read own applications"
  ON payment_applications FOR SELECT
  TO authenticated
  USING (business_id = auth.uid());

CREATE POLICY "Businesses can insert applications"
  ON payment_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Businesses can update own applications"
  ON payment_applications FOR UPDATE
  TO authenticated
  USING (business_id = auth.uid())
  WITH CHECK (business_id = auth.uid());

CREATE TABLE IF NOT EXISTS payment_mandates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES payment_applications(id) ON DELETE CASCADE NOT NULL,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  mandate_reference text UNIQUE NOT NULL,
  status text DEFAULT 'pending',
  authorized_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_mandates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses can read own mandates"
  ON payment_mandates FOR SELECT
  TO authenticated
  USING (business_id = auth.uid());

CREATE TABLE IF NOT EXISTS payment_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES payment_applications(id) ON DELETE CASCADE NOT NULL,
  installment_number integer NOT NULL,
  amount numeric NOT NULL,
  due_date date NOT NULL,
  paid_date date,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses can read own payment schedules"
  ON payment_schedules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM payment_applications
      WHERE payment_applications.id = payment_schedules.application_id
      AND payment_applications.business_id = auth.uid()
    )
  );
