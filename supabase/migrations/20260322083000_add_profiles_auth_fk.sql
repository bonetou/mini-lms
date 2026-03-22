DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_id_auth_users_fkey'
  ) THEN
    ALTER TABLE "public"."profiles"
      ADD CONSTRAINT "profiles_id_auth_users_fkey"
      FOREIGN KEY ("id")
      REFERENCES "auth"."users" ("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
  END IF;
END
$$;
