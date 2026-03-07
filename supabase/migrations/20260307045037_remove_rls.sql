-- Open up RLS policies to allow guest (unauthenticated) access
-- Since we removed auth, all users are anonymous/anon role

-- PROFILES: allow anyone to read, insert, and update their own
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

CREATE POLICY "Anyone can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can create a profile" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update profiles" ON profiles FOR UPDATE USING (true) WITH CHECK (true);

-- MEETUPS: allow anyone to read, create, update
DROP POLICY IF EXISTS "meetups_select_policy" ON meetups;
DROP POLICY IF EXISTS "meetups_insert_policy" ON meetups;
DROP POLICY IF EXISTS "meetups_update_policy" ON meetups;
DROP POLICY IF EXISTS "Enable read access for all users" ON meetups;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON meetups;
DROP POLICY IF EXISTS "Users can create meetups" ON meetups;
DROP POLICY IF EXISTS "Anyone can view meetups" ON meetups;

CREATE POLICY "Anyone can read meetups" ON meetups FOR SELECT USING (true);
CREATE POLICY "Anyone can create meetups" ON meetups FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update meetups" ON meetups FOR UPDATE USING (true) WITH CHECK (true);

-- MEETUP_ATTENDEES: allow anyone to read, join (insert), leave (delete)
DROP POLICY IF EXISTS "meetup_attendees_select_policy" ON meetup_attendees;
DROP POLICY IF EXISTS "meetup_attendees_insert_policy" ON meetup_attendees;
DROP POLICY IF EXISTS "meetup_attendees_delete_policy" ON meetup_attendees;
DROP POLICY IF EXISTS "Enable read access for all users" ON meetup_attendees;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON meetup_attendees;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON meetup_attendees;
DROP POLICY IF EXISTS "Anyone can view attendees" ON meetup_attendees;
DROP POLICY IF EXISTS "Users can join meetups" ON meetup_attendees;
DROP POLICY IF EXISTS "Users can leave meetups" ON meetup_attendees;

CREATE POLICY "Anyone can read attendees" ON meetup_attendees FOR SELECT USING (true);
CREATE POLICY "Anyone can join meetups" ON meetup_attendees FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can leave meetups" ON meetup_attendees FOR DELETE USING (true);

-- MEETUP_MESSAGES: allow anyone to read and send messages
DROP POLICY IF EXISTS "meetup_messages_select_policy" ON meetup_messages;
DROP POLICY IF EXISTS "meetup_messages_insert_policy" ON meetup_messages;
DROP POLICY IF EXISTS "Enable read access for all users" ON meetup_messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON meetup_messages;
DROP POLICY IF EXISTS "Anyone can read messages" ON meetup_messages;
DROP POLICY IF EXISTS "Attendees can send messages" ON meetup_messages;

CREATE POLICY "Anyone can read messages" ON meetup_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can send messages" ON meetup_messages FOR INSERT WITH CHECK (true);

-- POSTS: allow anyone to read, create
DROP POLICY IF EXISTS "posts_select_policy" ON posts;
DROP POLICY IF EXISTS "posts_insert_policy" ON posts;
DROP POLICY IF EXISTS "posts_delete_policy" ON posts;
DROP POLICY IF EXISTS "Enable read access for all users" ON posts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON posts;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON posts;
DROP POLICY IF EXISTS "Anyone can view posts" ON posts;
DROP POLICY IF EXISTS "Users can create posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;

CREATE POLICY "Anyone can read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Anyone can create posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete posts" ON posts FOR DELETE USING (true);

-- ROUNDS: allow anyone to read, create, update, delete
DROP POLICY IF EXISTS "rounds_select_policy" ON rounds;
DROP POLICY IF EXISTS "rounds_insert_policy" ON rounds;
DROP POLICY IF EXISTS "rounds_update_policy" ON rounds;
DROP POLICY IF EXISTS "rounds_delete_policy" ON rounds;
DROP POLICY IF EXISTS "Enable read access for all users" ON rounds;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON rounds;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON rounds;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON rounds;
DROP POLICY IF EXISTS "Public rounds visible" ON rounds;
DROP POLICY IF EXISTS "Users can create rounds" ON rounds;
DROP POLICY IF EXISTS "Users can update own rounds" ON rounds;
DROP POLICY IF EXISTS "Users can delete own rounds" ON rounds;

CREATE POLICY "Anyone can read rounds" ON rounds FOR SELECT USING (true);
CREATE POLICY "Anyone can create rounds" ON rounds FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rounds" ON rounds FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete rounds" ON rounds FOR DELETE USING (true);

-- LIKES: allow anyone to read, like, unlike
DROP POLICY IF EXISTS "likes_select_policy" ON likes;
DROP POLICY IF EXISTS "likes_insert_policy" ON likes;
DROP POLICY IF EXISTS "likes_delete_policy" ON likes;
DROP POLICY IF EXISTS "Enable read access for all users" ON likes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON likes;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON likes;

CREATE POLICY "Anyone can read likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Anyone can like" ON likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can unlike" ON likes FOR DELETE USING (true);

-- POST_REACTIONS: allow anyone to read, react, unreact
DROP POLICY IF EXISTS "post_reactions_select_policy" ON post_reactions;
DROP POLICY IF EXISTS "post_reactions_insert_policy" ON post_reactions;
DROP POLICY IF EXISTS "post_reactions_delete_policy" ON post_reactions;
DROP POLICY IF EXISTS "Enable read access for all users" ON post_reactions;

CREATE POLICY "Anyone can read reactions" ON post_reactions FOR SELECT USING (true);
CREATE POLICY "Anyone can react" ON post_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can unreact" ON post_reactions FOR DELETE USING (true);

-- CONNECTIONS: allow anyone to read, create, update, delete
DROP POLICY IF EXISTS "connections_select_policy" ON connections;
DROP POLICY IF EXISTS "connections_insert_policy" ON connections;
DROP POLICY IF EXISTS "connections_update_policy" ON connections;
DROP POLICY IF EXISTS "connections_delete_policy" ON connections;
DROP POLICY IF EXISTS "Enable read access for all users" ON connections;

CREATE POLICY "Anyone can read connections" ON connections FOR SELECT USING (true);
CREATE POLICY "Anyone can create connections" ON connections FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update connections" ON connections FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete connections" ON connections FOR DELETE USING (true);

-- LISTINGS: allow anyone to read, create, update, delete
DROP POLICY IF EXISTS "listings_select_policy" ON listings;
DROP POLICY IF EXISTS "listings_insert_policy" ON listings;
DROP POLICY IF EXISTS "listings_update_policy" ON listings;
DROP POLICY IF EXISTS "listings_delete_policy" ON listings;
DROP POLICY IF EXISTS "Enable read access for all users" ON listings;

CREATE POLICY "Anyone can read listings" ON listings FOR SELECT USING (true);
CREATE POLICY "Anyone can create listings" ON listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update listings" ON listings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete listings" ON listings FOR DELETE USING (true);

-- COURSES: read-only for everyone (already likely open)
DROP POLICY IF EXISTS "courses_select_policy" ON courses;
DROP POLICY IF EXISTS "Enable read access for all users" ON courses;
DROP POLICY IF EXISTS "Anyone can read courses" ON courses;

CREATE POLICY "Anyone can read courses" ON courses FOR SELECT USING (true);
