-- Quick fix to add DELETE permissions for posts
-- Run this in your Supabase SQL Editor

-- First, drop any existing policies that might conflict
DROP POLICY IF EXISTS "Anyone can view non-moderated posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Anyone can create posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Anyone can update posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Anyone can delete posts" ON public.forum_posts;

DROP POLICY IF EXISTS "Anyone can view non-moderated comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Anyone can create comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Anyone can update comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Anyone can delete comments" ON public.forum_comments;

-- Now create all policies fresh
CREATE POLICY "Anyone can view non-moderated posts" ON public.forum_posts FOR SELECT USING (NOT is_moderated);
CREATE POLICY "Anyone can create posts" ON public.forum_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update posts" ON public.forum_posts FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete posts" ON public.forum_posts FOR DELETE USING (true);

CREATE POLICY "Anyone can view non-moderated comments" ON public.forum_comments FOR SELECT USING (NOT is_moderated);
CREATE POLICY "Anyone can create comments" ON public.forum_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update comments" ON public.forum_comments FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete comments" ON public.forum_comments FOR DELETE USING (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('forum_posts', 'forum_comments') 
ORDER BY tablename, cmd;
