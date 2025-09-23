-- Add feedback tracking table for resources
CREATE TABLE IF NOT EXISTS public.resource_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL,
  user_id UUID,
  rating INTEGER NOT NULL CHECK (rating IN (1, -1)), -- 1 for thumbs up, -1 for thumbs down
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on resource_feedback
ALTER TABLE public.resource_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for resource feedback
CREATE POLICY "Anyone can create feedback" 
ON public.resource_feedback 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view feedback" 
ON public.resource_feedback 
FOR SELECT 
USING (true);

-- Add helpful_count and not_helpful_count to resources table for quick access
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS not_helpful_count INTEGER DEFAULT 0;

-- Create function to update feedback counts
CREATE OR REPLACE FUNCTION public.update_resource_feedback_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update helpful and not helpful counts for the resource
  UPDATE public.resources 
  SET 
    helpful_count = (
      SELECT COALESCE(COUNT(*), 0) 
      FROM public.resource_feedback 
      WHERE resource_id = NEW.resource_id AND rating = 1
    ),
    not_helpful_count = (
      SELECT COALESCE(COUNT(*), 0) 
      FROM public.resource_feedback 
      WHERE resource_id = NEW.resource_id AND rating = -1
    )
  WHERE id = NEW.resource_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic feedback count updates
CREATE TRIGGER update_resource_feedback_counts_trigger
AFTER INSERT ON public.resource_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_resource_feedback_counts();

-- Insert sample resources organized by the three main categories
-- First, let's insert the three main categories
INSERT INTO public.resource_categories (id, name_en, name_hi, slug) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Relaxation', 'विश्राम', 'relaxation'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Study Stress', 'अध्ययन तनाव', 'study-stress'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Sleep', 'नींद', 'sleep')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample resources for each category
INSERT INTO public.resources (id, title_en, title_hi, description_en, description_hi, content_en, content_hi, type, category_id, duration_minutes, file_url, thumbnail_url, is_featured, view_count)
VALUES 
  -- Relaxation Resources
  (
    '550e8400-e29b-41d4-a716-446655440011',
    'Guided Breathing Exercise',
    'निर्देशित श्वास अभ्यास',
    '2-minute guided breathing exercise to help you relax and center yourself.',
    '2-मिनट का निर्देशित श्वास अभ्यास जो आपको आराम करने और केंद्रित होने में मदद करता है।',
    'Take a comfortable position. Breathe in slowly for 4 counts, hold for 4, exhale for 6. Repeat and feel the calm.',
    'एक आरामदायक स्थिति लें। 4 गिनती के लिए धीरे-धीरे सांस लें, 4 के लिए रोकें, 6 के लिए छोड़ें। दोहराएं और शांति महसूस करें।',
    'video',
    '550e8400-e29b-41d4-a716-446655440001',
    2,
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&fit=crop',
    true,
    156
  ),
  (
    '550e8400-e29b-41d4-a716-446655440012',
    'Mindfulness Meditation',
    'माइंडफुलनेस मेडिटेशन',
    '5-minute mindfulness exercise to bring awareness to the present moment.',
    '5-मिनट का माइंडफुलनेस अभ्यास जो वर्तमान क्षण में जागरूकता लाता है।',
    'Close your eyes and focus on your breath. Notice thoughts without judgment, then gently return to breathing.',
    'अपनी आंखें बंद करें और अपनी सांस पर ध्यान दें। बिना निर्णय के विचारों को देखें, फिर धीरे से सांस लेने पर वापस लौटें।',
    'audio',
    '550e8400-e29b-41d4-a716-446655440001',
    5,
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    null,
    false,
    89
  ),
  
  -- Study Stress Resources
  (
    '550e8400-e29b-41d4-a716-446655440021',
    'Managing Exam Pressure',
    'परीक्षा दबाव का प्रबंधन',
    'Animated explainer on how to handle exam stress and maintain mental balance.',
    'परीक्षा तनाव को संभालने और मानसिक संतुलन बनाए रखने पर एनिमेटेड व्याख्या।',
    'Learn effective strategies: time management, deep breathing, positive self-talk, and breaking tasks into smaller chunks.',
    'प्रभावी रणनीतियां सीखें: समय प्रबंधन, गहरी सांस, सकारात्मक आत्म-चर्चा, और कार्यों को छोटे हिस्सों में तोड़ना।',
    'video',
    '550e8400-e29b-41d4-a716-446655440002',
    8,
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
    true,
    234
  ),
  (
    '550e8400-e29b-41d4-a716-446655440022',
    'Top 5 Study-Time Stress Hacks',
    'टॉप 5 अध्ययन समय तनाव हैक्स',
    'Quick reference PDF with practical tips to reduce stress during study sessions.',
    'अध्ययन सत्र के दौरान तनाव कम करने के लिए व्यावहारिक सुझावों के साथ त्वरित संदर्भ PDF।',
    'Quick reference checklist: 1) Pomodoro technique 2) Proper lighting 3) Hydration breaks 4) Stretching 5) Positive affirmations',
    'त्वरित संदर्भ चेकलिस्ट: 1) पोमोडोरो तकनीक 2) उचित प्रकाश 3) हाइड्रेशन ब्रेक 4) स्ट्रेचिंग 5) सकारात्मक पुष्टि',
    'pdf',
    '550e8400-e29b-41d4-a716-446655440002',
    null,
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    null,
    false,
    167
  ),
  
  -- Sleep Resources
  (
    '550e8400-e29b-41d4-a716-446655440031',
    'Sleep Hygiene Tips',
    'नींद स्वच्छता युक्तियाँ',
    'Essential sleep hygiene practices for better rest and mental health.',
    'बेहतर आराम और मानसिक स्वास्थ्य के लिए आवश्यक नींद स्वच्छता प्रथाएं।',
    'Create a bedtime routine: no screens 1 hour before bed, cool room temperature, comfortable bedding, and relaxation techniques.',
    'सोने का समय बनाएं: सोने से 1 घंटे पहले स्क्रीन नहीं, कमरे का ठंडा तापमान, आरामदायक बिस्तर, और विश्राम तकनीकें।',
    'video',
    '550e8400-e29b-41d4-a716-446655440003',
    6,
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop',
    false,
    198
  ),
  (
    '550e8400-e29b-41d4-a716-446655440032',
    'Bedtime Relaxation Track',
    'सोने का समय विश्राम ट्रैक',
    'Calming audio track designed to help you unwind and prepare for restful sleep.',
    'शांत करने वाला ऑडियो ट्रैक जो आपको आराम करने और आरामदायक नींद के लिए तैयार करने में मदद करता है।',
    'Gentle nature sounds mixed with soft instrumental music to create the perfect atmosphere for sleep.',
    'नींद के लिए सही माहौल बनाने के लिए कोमल प्राकृतिक ध्वनियों को मुलायम वाद्य संगीत के साथ मिलाया गया है।',
    'audio',
    '550e8400-e29b-41d4-a716-446655440003',
    12,
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    null,
    true,
    145
  )
ON CONFLICT (id) DO NOTHING;