import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useSimpleMeetingCreation = () => {
  const [isCreating, setIsCreating] = useState(false);

  const createMeeting = async (facilitatorName: string, meetingTitle: string) => {
    setIsCreating(true);
    try {
      // Generate a unique meeting code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data, error } = await supabase
        .from('meetings')
        .insert({
          meeting_code: code,
          title: meetingTitle,
          facilitator_name: facilitatorName,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating meeting:', error);
        throw error;
      }

      toast({
        title: 'Meeting Created',
        description: `Your meeting code is: ${code}`,
      });

      return { meetingCode: code, meeting: data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create meeting';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return { createMeeting, isCreating };
};
