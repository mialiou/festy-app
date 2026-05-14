-- Run in Supabase SQL Editor after unmatched users have signed up.
-- Links pending experiences to their real profile IDs and clears the pending_username.

UPDATE experiences
SET    user_id         = p.id,
       pending_username = NULL
FROM   profiles p
WHERE  lower(p.username) = lower(experiences.pending_username)
  AND  experiences.user_id IS NULL;
