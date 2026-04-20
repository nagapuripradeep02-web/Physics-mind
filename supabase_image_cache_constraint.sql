-- Fix: add missing UNIQUE constraint on image_context_cache.image_sha256
-- The upsert in chat/route.ts uses ON CONFLICT (image_sha256) which requires
-- this constraint to exist. Run once in the Supabase SQL Editor.

ALTER TABLE image_context_cache
  ADD CONSTRAINT image_context_cache_image_sha256_unique
  UNIQUE (image_sha256);
