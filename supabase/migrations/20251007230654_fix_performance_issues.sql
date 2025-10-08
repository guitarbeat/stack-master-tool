-- Fix Performance Issues in RLS Policies and Database Indexes
-- This migration addresses the performance issues identified by Supabase advisors

-- ============================================
-- 1. FIX AUTH RLS INITPLAN PERFORMANCE ISSUES
-- ============================================
-- Wrap auth.uid() calls with (select auth.uid()) to avoid re-evaluation for each row

-- Fix speaking_queue policies
DROP POLICY IF EXISTS "Participants can join queue" ON public.speaking_queue;
CREATE POLICY "Participants can join queue"
ON public.speaking_queue
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.participants
    WHERE participants.id = speaking_queue.participant_id
    AND participants.user_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can leave their own queue" ON public.speaking_queue;
CREATE POLICY "Users can leave their own queue"
ON public.speaking_queue
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.participants
    WHERE participants.id = speaking_queue.participant_id
    AND participants.user_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Facilitators can manage queue" ON public.speaking_queue;
CREATE POLICY "Facilitators can manage queue"
ON public.speaking_queue
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.meetings
    WHERE meetings.id = speaking_queue.meeting_id
    AND meetings.facilitator_id = (select auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.meetings
    WHERE meetings.id = speaking_queue.meeting_id
    AND meetings.facilitator_id = (select auth.uid())
  )
);

-- Fix meetings policies
DROP POLICY IF EXISTS "Facilitators can update own meetings" ON public.meetings;
CREATE POLICY "Facilitators can update own meetings"
ON public.meetings
FOR UPDATE
TO authenticated
USING (facilitator_id = (select auth.uid()))
WITH CHECK (facilitator_id = (select auth.uid()));

-- Fix participants policies
DROP POLICY IF EXISTS "Authenticated users can join" ON public.participants;
CREATE POLICY "Authenticated users can join"
ON public.participants
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own record" ON public.participants;
CREATE POLICY "Users can update own record"
ON public.participants
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Facilitators can update meeting participants" ON public.participants;
CREATE POLICY "Facilitators can update meeting participants"
ON public.participants
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.meetings
    WHERE meetings.id = participants.meeting_id
    AND meetings.facilitator_id = (select auth.uid())
  )
);

-- ============================================
-- 2. ADD MISSING INDEX FOR FOREIGN KEY
-- ============================================
-- Add index for speaking_queue_participant_id_fkey to improve performance

CREATE INDEX IF NOT EXISTS idx_speaking_queue_participant_id
ON public.speaking_queue(participant_id);

-- ============================================
-- 3. REMOVE UNUSED INDEX
-- ============================================
-- Remove the unused idx_queue_meeting index as reported by advisors

DROP INDEX IF EXISTS idx_queue_meeting;
