-- Simple fix: Just add DELETE permissions
-- Run this in your Supabase SQL Editor

-- Check if DELETE policies already exist
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'forum_posts' 
AND cmd = 'DELETE';

-- Add DELETE policy for forum_posts (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'forum_posts' 
        AND policyname = 'Anyone can delete posts'
    ) THEN
        CREATE POLICY "Anyone can delete posts" ON public.forum_posts FOR DELETE USING (true);
    END IF;
END $$;

-- Add DELETE policy for forum_comments (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'forum_comments' 
        AND policyname = 'Anyone can delete comments'
    ) THEN
        CREATE POLICY "Anyone can delete comments" ON public.forum_comments FOR DELETE USING (true);
    END IF;
END $$;

-- Verify the DELETE policies exist
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('forum_posts', 'forum_comments') 
AND cmd = 'DELETE';

