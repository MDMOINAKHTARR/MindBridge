-- Allow anonymous posts by modifying the user_id constraint
-- Step 1: Drop ALL existing policies that depend on user_id column
DROP POLICY IF EXISTS "Users can create posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can view non-moderated posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can create comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Users can view non-moderated comments" ON public.forum_comments;

-- Step 2: Drop the foreign key constraints
ALTER TABLE public.forum_posts DROP CONSTRAINT IF EXISTS forum_posts_user_id_fkey;
ALTER TABLE public.forum_comments DROP CONSTRAINT IF EXISTS forum_comments_user_id_fkey;

-- Step 3: Modify the user_id columns to allow any string (not just UUIDs from auth.users)
ALTER TABLE public.forum_posts ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.forum_comments ALTER COLUMN user_id TYPE TEXT;

-- Step 4: Create new policies that allow anonymous posts
CREATE POLICY "Anyone can view non-moderated posts" ON public.forum_posts FOR SELECT USING (NOT is_moderated);
CREATE POLICY "Anyone can create posts" ON public.forum_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update posts" ON public.forum_posts FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete posts" ON public.forum_posts FOR DELETE USING (true);

CREATE POLICY "Anyone can view non-moderated comments" ON public.forum_comments FOR SELECT USING (NOT is_moderated);
CREATE POLICY "Anyone can create comments" ON public.forum_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update comments" ON public.forum_comments FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete comments" ON public.forum_comments FOR DELETE USING (true);
