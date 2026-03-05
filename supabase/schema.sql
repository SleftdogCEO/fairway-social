-- Fairway Social - Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text not null,
  avatar_url text,
  bio text,
  handicap numeric(4,1),
  home_course text,
  location text,
  occupation text,
  company text,
  linkedin_url text,
  is_public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (is_public = true);

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- ============================================
-- COURSES
-- ============================================
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  address text,
  city text,
  state text,
  zip text,
  lat numeric(10,7),
  lng numeric(10,7),
  holes integer default 18,
  par integer default 72,
  slope_rating numeric(5,1),
  course_rating numeric(4,1),
  website text,
  phone text,
  image_url text,
  created_at timestamptz default now()
);

alter table public.courses enable row level security;

create policy "Courses are viewable by everyone"
  on public.courses for select using (true);

create policy "Authenticated users can add courses"
  on public.courses for insert with check (auth.role() = 'authenticated');

-- ============================================
-- ROUNDS (Live Activity & Scorecards)
-- ============================================
create type round_status as enum ('planned', 'active', 'completed');

create table public.rounds (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete set null,
  status round_status default 'planned',
  tee_time timestamptz,
  score integer,
  score_details jsonb, -- hole-by-hole scores
  notes text,
  is_public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.rounds enable row level security;

create policy "Public rounds are viewable by everyone"
  on public.rounds for select using (is_public = true);

create policy "Users can view their own rounds"
  on public.rounds for select using (auth.uid() = user_id);

create policy "Users can create their own rounds"
  on public.rounds for insert with check (auth.uid() = user_id);

create policy "Users can update their own rounds"
  on public.rounds for update using (auth.uid() = user_id);

create policy "Users can delete their own rounds"
  on public.rounds for delete using (auth.uid() = user_id);

-- ============================================
-- ROUND INVITES (Coordinate play with others)
-- ============================================
create type invite_status as enum ('pending', 'accepted', 'declined');

create table public.round_invites (
  id uuid default uuid_generate_v4() primary key,
  round_id uuid references public.rounds(id) on delete cascade not null,
  inviter_id uuid references public.profiles(id) on delete cascade not null,
  invitee_id uuid references public.profiles(id) on delete cascade not null,
  status invite_status default 'pending',
  message text,
  created_at timestamptz default now()
);

alter table public.round_invites enable row level security;

create policy "Users can see invites they sent or received"
  on public.round_invites for select
  using (auth.uid() = inviter_id or auth.uid() = invitee_id);

create policy "Users can create invites for their rounds"
  on public.round_invites for insert
  with check (auth.uid() = inviter_id);

create policy "Invitees can update invite status"
  on public.round_invites for update
  using (auth.uid() = invitee_id);

-- ============================================
-- POSTS (Photo feed / daily golf content)
-- ============================================
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  round_id uuid references public.rounds(id) on delete set null,
  content text,
  image_urls text[] default '{}',
  likes_count integer default 0,
  comments_count integer default 0,
  created_at timestamptz default now()
);

alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
  on public.posts for select using (true);

create policy "Users can create their own posts"
  on public.posts for insert with check (auth.uid() = user_id);

create policy "Users can update their own posts"
  on public.posts for update using (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on public.posts for delete using (auth.uid() = user_id);

-- ============================================
-- LIKES
-- ============================================
create table public.likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

alter table public.likes enable row level security;

create policy "Likes are viewable by everyone"
  on public.likes for select using (true);

create policy "Users can like posts"
  on public.likes for insert with check (auth.uid() = user_id);

create policy "Users can unlike posts"
  on public.likes for delete using (auth.uid() = user_id);

-- ============================================
-- COMMENTS
-- ============================================
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

create policy "Users can create comments"
  on public.comments for insert with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.comments for delete using (auth.uid() = user_id);

-- ============================================
-- MARKETPLACE (Buy/Sell Equipment)
-- ============================================
create type listing_condition as enum ('new', 'like_new', 'good', 'fair', 'poor');
create type listing_status as enum ('active', 'sold', 'removed');
create type listing_category as enum ('drivers', 'woods', 'hybrids', 'irons', 'wedges', 'putters', 'bags', 'balls', 'apparel', 'accessories', 'other');

create table public.listings (
  id uuid default uuid_generate_v4() primary key,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category listing_category not null,
  condition listing_condition not null,
  price numeric(10,2) not null,
  image_urls text[] default '{}',
  location text,
  status listing_status default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.listings enable row level security;

create policy "Active listings are viewable by everyone"
  on public.listings for select using (status = 'active' or auth.uid() = seller_id);

create policy "Users can create listings"
  on public.listings for insert with check (auth.uid() = seller_id);

create policy "Users can update their own listings"
  on public.listings for update using (auth.uid() = seller_id);

create policy "Users can delete their own listings"
  on public.listings for delete using (auth.uid() = seller_id);

-- ============================================
-- CONNECTIONS (Professional networking)
-- ============================================
create type connection_status as enum ('pending', 'accepted', 'blocked');

create table public.connections (
  id uuid default uuid_generate_v4() primary key,
  requester_id uuid references public.profiles(id) on delete cascade not null,
  addressee_id uuid references public.profiles(id) on delete cascade not null,
  status connection_status default 'pending',
  created_at timestamptz default now(),
  unique(requester_id, addressee_id)
);

alter table public.connections enable row level security;

create policy "Users can see their own connections"
  on public.connections for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "Users can request connections"
  on public.connections for insert
  with check (auth.uid() = requester_id);

create policy "Users can update connections they're part of"
  on public.connections for update
  using (auth.uid() = addressee_id or auth.uid() = requester_id);

-- ============================================
-- MESSAGES (Direct messaging)
-- ============================================
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "Users can see their own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "Recipients can mark messages as read"
  on public.messages for update
  using (auth.uid() = receiver_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Update likes count
create or replace function public.update_likes_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set likes_count = likes_count + 1 where id = new.post_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update public.posts set likes_count = likes_count - 1 where id = old.post_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_like_change
  after insert or delete on public.likes
  for each row execute function public.update_likes_count();

-- Update comments count
create or replace function public.update_comments_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set comments_count = comments_count + 1 where id = new.post_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update public.posts set comments_count = comments_count - 1 where id = old.post_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_comment_change
  after insert or delete on public.comments
  for each row execute function public.update_comments_count();

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger rounds_updated_at before update on public.rounds
  for each row execute function public.update_updated_at();

create trigger listings_updated_at before update on public.listings
  for each row execute function public.update_updated_at();

-- ============================================
-- STORAGE BUCKETS
-- ============================================
insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('posts', 'posts', true),
  ('listings', 'listings', true);

-- Storage policies
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Post images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'posts');

create policy "Users can upload post images"
  on storage.objects for insert
  with check (bucket_id = 'posts' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Listing images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'listings');

create policy "Users can upload listing images"
  on storage.objects for insert
  with check (bucket_id = 'listings' and auth.uid()::text = (storage.foldername(name))[1]);
