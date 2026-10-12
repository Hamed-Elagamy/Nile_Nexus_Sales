-- ============================================================================
-- Migration 010: Enable Realtime on Notifications Table & Column Compatibility
-- ============================================================================

-- 1. Ensure REPLICA IDENTITY is FULL for reliable realtime payload broadcasting
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- 2. Add notifications to Supabase Realtime Publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;

-- 3. Ensure compatibility columns exist (supporting both link/action_url and category/type)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'INFO';

-- Sync existing rows
UPDATE notifications SET action_url = link WHERE action_url IS NULL AND link IS NOT NULL;
UPDATE notifications SET link = action_url WHERE link IS NULL AND action_url IS NOT NULL;
UPDATE notifications SET type = category WHERE type IS NULL AND category IS NOT NULL;

-- 4. Sync trigger for seamless bi-directional column compatibility
CREATE OR REPLACE FUNCTION sync_notification_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.action_url IS NULL AND NEW.link IS NOT NULL THEN
    NEW.action_url := NEW.link;
  ELSIF NEW.link IS NULL AND NEW.action_url IS NOT NULL THEN
    NEW.link := NEW.action_url;
  END IF;

  IF NEW.type IS NULL AND NEW.category IS NOT NULL THEN
    NEW.type := NEW.category;
  ELSIF NEW.category IS NULL AND NEW.type IS NOT NULL THEN
    IF NEW.type = 'ALERT' THEN
      NEW.category := 'ACTION_REQUIRED';
    ELSE
      NEW.category := 'UPDATE';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_notification_columns ON notifications;
CREATE TRIGGER trg_sync_notification_columns
BEFORE INSERT OR UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION sync_notification_columns();

-- 5. Add DELETE policy for user notifications if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' AND policyname = 'notifications_delete'
  ) THEN
    CREATE POLICY notifications_delete ON notifications FOR DELETE
      USING (user_id = auth.uid());
  END IF;
END $$;
