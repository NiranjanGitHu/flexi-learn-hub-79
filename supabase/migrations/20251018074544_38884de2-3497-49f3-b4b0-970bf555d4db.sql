-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  school_name text,
  grade text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create user roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create subjects table
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  language text,
  level text,
  is_common boolean DEFAULT false,
  color text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subjects"
  ON public.subjects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage subjects"
  ON public.subjects FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create permission requests table
CREATE TABLE public.permission_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.permission_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own requests"
  ON public.permission_requests FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can create requests"
  ON public.permission_requests FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins can view all requests"
  ON public.permission_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update requests"
  ON public.permission_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create tutors table
CREATE TABLE public.tutors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialization text NOT NULL,
  experience_years integer,
  rating decimal(3,2),
  bio text,
  contact_email text,
  verified boolean DEFAULT true,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tutors"
  ON public.tutors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage tutors"
  ON public.tutors FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create tutorials table
CREATE TABLE public.tutorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
  description text,
  video_url text,
  duration_minutes integer,
  difficulty text,
  thumbnail_url text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tutorials"
  ON public.tutorials FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage tutorials"
  ON public.tutorials FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create flashcards table
CREATE TABLE public.flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  difficulty text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view flashcards"
  ON public.flashcards FOR SELECT
  TO authenticated
  USING (true);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  difficulty text,
  time_limit_minutes integer,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view quizzes"
  ON public.quizzes FOR SELECT
  TO authenticated
  USING (true);

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer text NOT NULL,
  explanation text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view quiz questions"
  ON public.quiz_questions FOR SELECT
  TO authenticated
  USING (true);

-- Create schedules table
CREATE TABLE public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  type text NOT NULL CHECK (type IN ('class', 'study', 'exam', 'hotseat', 'other')),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own schedules"
  ON public.schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own schedules"
  ON public.schedules FOR ALL
  USING (auth.uid() = user_id);

-- Create hotseat sessions table
CREATE TABLE public.hotseat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  tutor_id uuid REFERENCES public.tutors(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  max_participants integer DEFAULT 50,
  current_participants integer DEFAULT 0,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'ended')),
  meeting_link text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.hotseat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view hotseat sessions"
  ON public.hotseat_sessions FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User')
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample subjects with colors
INSERT INTO public.subjects (name, category, description, language, level, is_common, color) VALUES
('Advanced Mathematics', 'Science', 'Calculus, Linear Algebra, and Advanced Topics', 'English', 'Grade 11-12', false, '#3B82F6'),
('Physics', 'Science', 'Classical and Modern Physics', 'English', 'Grade 9-12', true, '#60A5FA'),
('Chemistry', 'Science', 'Organic and Inorganic Chemistry', 'English', 'Grade 9-12', true, '#06B6D4'),
('Biology', 'Science', 'Life Sciences and Ecology', 'English', 'Grade 9-12', true, '#10B981'),
('Sanskrit', 'Language', 'Classical Sanskrit Language and Literature', 'Sanskrit', 'Grade 9-12', false, '#A855F7'),
('French', 'Language', 'French Language and Culture', 'French', 'Grade 9-12', false, '#D946EF'),
('German', 'Language', 'German Language and Culture', 'German', 'Grade 9-12', false, '#C026D3'),
('Psychology', 'Social Science', 'Introduction to Psychology', 'English', 'Grade 11-12', false, '#22C55E'),
('History', 'Social Science', 'World and Indian History', 'English', 'Grade 9-12', true, '#84CC16'),
('Geography', 'Social Science', 'Physical and Human Geography', 'English', 'Grade 9-12', true, '#65A30D'),
('Philosophy', 'Humanities', 'Introduction to Philosophy and Ethics', 'English', 'Grade 11-12', false, '#F97316'),
('Computer Science', 'Technology', 'Programming and Computer Fundamentals', 'English', 'Grade 9-12', true, '#14B8A6'),
('Music', 'Arts', 'Music Theory and Practice', 'English', 'Grade 6-12', false, '#F59E0B'),
('Fine Arts', 'Arts', 'Drawing, Painting, and Sculpture', 'English', 'Grade 6-12', false, '#EAB308'),
('Business Studies', 'Commerce', 'Business Management and Economics', 'English', 'Grade 11-12', false, '#EF4444'),
('Accountancy', 'Commerce', 'Financial Accounting and Auditing', 'English', 'Grade 11-12', false, '#DC2626');

-- Insert sample tutors
INSERT INTO public.tutors (name, specialization, experience_years, rating, bio, contact_email, avatar_url) VALUES
('Dr. Priya Sharma', 'Advanced Mathematics', 12, 4.9, 'PhD in Mathematics with 12 years teaching experience', 'priya.sharma@eduflex.in', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'),
('Prof. Rajesh Kumar', 'Sanskrit', 15, 4.8, 'Sanskrit scholar and professor at Delhi University', 'rajesh.kumar@eduflex.in', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh'),
('Marie Dubois', 'French', 8, 4.7, 'Native French speaker with teaching certification', 'marie.dubois@eduflex.in', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie'),
('Hans Mueller', 'German', 10, 4.8, 'German language expert with international experience', 'hans.mueller@eduflex.in', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hans'),
('Dr. Ananya Mehta', 'Psychology', 9, 4.9, 'Clinical psychologist and educator', 'ananya.mehta@eduflex.in', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya'),
('Prof. Vikram Singh', 'Philosophy', 14, 4.7, 'Philosophy professor with focus on Indian philosophy', 'vikram.singh@eduflex.in', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram');

-- Insert sample flashcards
INSERT INTO public.flashcards (subject_id, question, answer, difficulty) 
SELECT id, 'What is the fundamental theorem of calculus?', 'The fundamental theorem of calculus links differentiation and integration, showing they are inverse operations.', 'Medium'
FROM public.subjects WHERE name = 'Advanced Mathematics';

INSERT INTO public.flashcards (subject_id, question, answer, difficulty) 
SELECT id, 'What is Newton''s First Law?', 'An object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force.', 'Easy'
FROM public.subjects WHERE name = 'Physics';

-- Insert sample quizzes
INSERT INTO public.quizzes (subject_id, title, description, difficulty, time_limit_minutes)
SELECT id, 'Calculus Basics Quiz', 'Test your understanding of basic calculus concepts', 'Medium', 30
FROM public.subjects WHERE name = 'Advanced Mathematics';

INSERT INTO public.quizzes (subject_id, title, description, difficulty, time_limit_minutes)
SELECT id, 'Chemistry Fundamentals', 'Quick quiz on basic chemistry concepts', 'Easy', 20
FROM public.subjects WHERE name = 'Chemistry';