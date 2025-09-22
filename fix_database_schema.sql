-- SQL script to fix database schema for anonymous posts
-- Run this directly in your Supabase SQL editor

-- First, check if the tables exist and their current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'forum_posts' AND table_schema = 'public';

-- Step 1: Drop ALL existing policies that depend on user_id column
DROP POLICY IF EXISTS "Users can create posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can view non-moderated posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can create comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Users can view non-moderated comments" ON public.forum_comments;

-- Step 2: Drop existing foreign key constraints
ALTER TABLE public.forum_posts DROP CONSTRAINT IF EXISTS forum_posts_user_id_fkey;
ALTER TABLE public.forum_comments DROP CONSTRAINT IF EXISTS forum_comments_user_id_fkey;

-- Step 3: Modify user_id columns to allow any text (not just UUIDs)
ALTER TABLE public.forum_posts ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.forum_comments ALTER COLUMN user_id TYPE TEXT;

-- Step 4: Recreate policies that allow anonymous posts
CREATE POLICY "Anyone can view non-moderated posts" ON public.forum_posts FOR SELECT USING (NOT is_moderated);
CREATE POLICY "Anyone can create posts" ON public.forum_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update posts" ON public.forum_posts FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete posts" ON public.forum_posts FOR DELETE USING (true);

CREATE POLICY "Anyone can view non-moderated comments" ON public.forum_comments FOR SELECT USING (NOT is_moderated);
CREATE POLICY "Anyone can create comments" ON public.forum_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update comments" ON public.forum_comments FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete comments" ON public.forum_comments FOR DELETE USING (true);

-- Ensure forum categories exist (insert if they don't)
INSERT INTO public.forum_categories (name_en, name_hi, description_en, description_hi, slug, is_active) 
VALUES 
  ('General Support', 'सामान्य सहायता', 'Share your experiences and support each other', 'अपने अनुभव साझा करें और एक-दूसरे का समर्थन करें', 'general-support', true),
  ('Academic Stress', 'शैक्षणिक तनाव', 'Discuss study-related challenges and solutions', 'अध्ययन संबंधी चुनौतियों और समाधानों पर चर्चा करें', 'academic-stress', true),
  ('Exam Anxiety', 'परीक्षा की चिंता', 'Tips and support for managing exam stress', 'परीक्षा के तनाव को संभालने के लिए सुझाव और सहायता', 'exam-anxiety', true),
  ('Campus Life', 'कैंपस जीवन', 'Connect with fellow students about campus experiences', 'कैंपस के अनुभवों के बारे में साथी छात्रों से जुड़ें', 'campus-life', true)
ON CONFLICT (slug) DO NOTHING;

-- Verify the changes
SELECT 'forum_posts table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'forum_posts' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'forum_categories data:' as info;
SELECT * FROM public.forum_categories WHERE is_active = true;
