-- ControL-D Supabase Database Schema
-- Copy and run this script in your Supabase SQL Editor (Dashboard -> SQL Editor)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT,
  age INT,
  weight NUMERIC,
  height NUMERIC,
  gender TEXT,
  activity_level TEXT,
  diabetes_type TEXT,
  target_water INT,
  target_calories INT
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert/update own profile" 
  ON public.profiles FOR ALL 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);

-- 3. Daily Health Logs Table
CREATE TABLE IF NOT EXISTS public.daily_health (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

ALTER TABLE public.daily_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health logs" 
  ON public.daily_health FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update own health logs" 
  ON public.daily_health FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- 4. Function & Trigger for Auto Profile Creation on User Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, split_part(new.email, '@', 1));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
