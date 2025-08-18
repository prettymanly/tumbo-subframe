-- Master Script: Insert All Tags for Tümbo
-- Run this after creating the main schema (tag-system-schema.sql)
-- This script will insert all 4 tag types in the correct order

-- Step 1: Insert Content Tags
\echo 'Inserting Content Tags...'
\i insert-content-tags.sql

-- Step 2: Insert Philosophy Tags  
\echo 'Inserting Philosophy Tags...'
\i insert-philosophy-tags.sql

-- Step 3: Insert Experience Tags
\echo 'Inserting Experience Tags...'
\i insert-experience-tags.sql

-- Step 4: Insert Child Tags
\echo 'Inserting Child Tags...'
\i insert-child-tags.sql

-- Final verification
\echo 'Verifying all tags...'
SELECT 
    tt.name as tag_type,
    COUNT(t.id) as tag_count
FROM tag_types tt
LEFT JOIN tags t ON tt.id = t.tag_type_id
GROUP BY tt.id, tt.name
ORDER BY tt.sort_order;

\echo 'Tag system setup complete!'
