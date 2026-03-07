-- Proposals: coordinate a round when time/course isn't decided yet
CREATE TABLE proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  organizer_id uuid NOT NULL REFERENCES profiles(id),
  message text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'confirmed', 'cancelled')),
  confirmed_meetup_id uuid REFERENCES meetups(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Time options the organizer proposes
CREATE TABLE proposal_times (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  date_time timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Course options the organizer proposes
CREATE TABLE proposal_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id),
  course_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Votes from invitees on times
CREATE TABLE proposal_time_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_time_id uuid NOT NULL REFERENCES proposal_times(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  vote text NOT NULL CHECK (vote IN ('yes', 'maybe', 'no')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(proposal_time_id, user_id)
);

-- Votes from invitees on courses
CREATE TABLE proposal_course_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_course_id uuid NOT NULL REFERENCES proposal_courses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  vote text NOT NULL CHECK (vote IN ('yes', 'maybe', 'no')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(proposal_course_id, user_id)
);

-- Open RLS for guest access
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_time_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_course_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "open_select" ON proposals FOR SELECT USING (true);
CREATE POLICY "open_insert" ON proposals FOR INSERT WITH CHECK (true);
CREATE POLICY "open_update" ON proposals FOR UPDATE USING (true);

CREATE POLICY "open_select" ON proposal_times FOR SELECT USING (true);
CREATE POLICY "open_insert" ON proposal_times FOR INSERT WITH CHECK (true);

CREATE POLICY "open_select" ON proposal_courses FOR SELECT USING (true);
CREATE POLICY "open_insert" ON proposal_courses FOR INSERT WITH CHECK (true);

CREATE POLICY "open_select" ON proposal_time_votes FOR SELECT USING (true);
CREATE POLICY "open_insert" ON proposal_time_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "open_update" ON proposal_time_votes FOR UPDATE USING (true);
CREATE POLICY "open_delete" ON proposal_time_votes FOR DELETE USING (true);

CREATE POLICY "open_select" ON proposal_course_votes FOR SELECT USING (true);
CREATE POLICY "open_insert" ON proposal_course_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "open_update" ON proposal_course_votes FOR UPDATE USING (true);
CREATE POLICY "open_delete" ON proposal_course_votes FOR DELETE USING (true);
