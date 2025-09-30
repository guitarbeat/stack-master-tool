import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Confetti from '../components/ui/Confetti.jsx'
import MeetingCreationForm from '../components/meeting/MeetingCreationForm'
import MeetingSuccessStep from '../components/meeting/MeetingSuccessStep'
import { useMeetingCreation } from '../hooks/useMeetingCreation'

function CreateMeeting(): JSX.Element {
  const navigate = useNavigate()
  const {
    step,
    loading,
    error,
    meetingData,
    qrCodeUrl,
    confettiKey,
    setStep,
    setMeetingData,
    handleCreateMeeting,
    copyToClipboard,
    startMeeting,
  } = useMeetingCreation()

  return (
    <div className="container mx-auto px-4 py-8">
      <Confetti triggerKey={confettiKey} />
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => (step === 1 ? navigate("/") : setStep(1))}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        {step === 1 && (
          <MeetingCreationForm
            meetingData={{
              name: meetingData.name,
              facilitatorName: meetingData.facilitatorName,
            }}
            loading={loading}
            error={error}
            onChange={setMeetingData}
            onSubmit={handleCreateMeeting}
          />
        )}

        {step === 2 && (
          <MeetingSuccessStep
            meetingCode={meetingData.meetingCode}
            shareableLink={meetingData.shareableLink}
            qrCodeUrl={qrCodeUrl}
            onCopyCode={copyToClipboard}
            onStartMeeting={startMeeting}
          />
        )}
      </div>
    </div>
  )
}

export default CreateMeeting
