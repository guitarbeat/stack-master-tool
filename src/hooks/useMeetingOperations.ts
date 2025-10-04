import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Meeting {
  id: string;
  meeting_code: string;
  title: string;
  facilitator_name: string;
  is_active: boolean | null;
  created_at: string;
}

export const useMeetingOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMeeting = async (title: string, facilitatorName: string): Promise<Meeting | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate a unique meeting code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data, error: insertError } = await supabase
        .from('meetings')
        .insert({
          meeting_code: code,
          title,
          facilitator_name: facilitatorName,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: 'Meeting Created',
        description: `Meeting code: ${code}`,
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create meeting';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getMeetingByCode = async (code: string): Promise<Meeting | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('meetings')
        .select('*')
        .eq('meeting_code', code.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('Meeting not found');
        return null;
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch meeting';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createMeeting,
    getMeetingByCode,
    isLoading,
    error,
  };
};
