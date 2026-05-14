-- Add city column to festivals for coarse-grained location filtering.
-- After running, update the city values via the admin UI or import script.
-- Example: all Nürnberg-area Kirchweihs → city = 'Nürnberg'

ALTER TABLE festivals ADD COLUMN IF NOT EXISTS city text;

-- Optionally seed city from location where the location IS already a city name:
-- UPDATE festivals SET city = location WHERE location IN ('Nürnberg', 'Fürth', 'Erlangen', 'Schwabach');
