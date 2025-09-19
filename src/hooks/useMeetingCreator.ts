import { useState, useEffect, useCallback } from 'react'
import apiService from '../services/api'

interface MeetingCreatorData {
  meetingCode: string
  meetingId: string
  facilitatorName: string
  meetingTitle: string
  facilitatorToken: string
  shareUrl: string
}

interface UseMeetingCreatorReturn {
  creatorData: MeetingCreatorData | null
  isCreator: boolean
  setCreator: (data: MeetingCreatorData) => void
  clearCreator: () => void
  validateFacilitator: (meetingCode: string, facilitatorName: string, facilitatorToken: string) => Promise<boolean>
  isLoading: boolean
  error: string | null
}

const STORAGE_KEY = 'meetingCreator'

export function useMeetingCreator(): UseMeetingCreatorReturn {
  const [creatorData, setCreatorData] = useState<MeetingCreatorData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load creator data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Validate that all required fields are present
        if (parsed.meetingCode && parsed.facilitatorName && parsed.facilitatorToken) {
          setCreatorData(parsed)
        } else {
          // Clear invalid data
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    } catch (err) {
      console.error('Error loading meeting creator data:', err)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const setCreator = useCallback((data: MeetingCreatorData) => {
    try {
      setCreatorData(data)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setError(null)
    } catch (err) {
      console.error('Error saving meeting creator data:', err)
      setError('Failed to save facilitator data')
    }
  }, [])

  const clearCreator = useCallback(() => {
    setCreatorData(null)
    localStorage.removeItem(STORAGE_KEY)
    setError(null)
  }, [])

  const validateFacilitator = useCallback(async (
    meetingCode: string, 
    facilitatorName: string, 
    facilitatorToken: string
  ): Promise<boolean> => {
    if (!meetingCode || !facilitatorName || !facilitatorToken) {
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiService.baseUrl}/api/meetings/${meetingCode}/validate-facilitator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facilitatorName,
          facilitatorToken
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.valid === true
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Facilitator validation failed:', errorData.error)
        setError(errorData.error || 'Failed to validate facilitator')
        return false
      }
    } catch (err) {
      console.error('Error validating facilitator:', err)
      setError('Network error during validation')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    creatorData,
    isCreator: creatorData !== null,
    setCreator,
    clearCreator,
    validateFacilitator,
    isLoading,
    error
  }
}

export default useMeetingCreator