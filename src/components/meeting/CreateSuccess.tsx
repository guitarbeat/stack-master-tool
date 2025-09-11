import React from 'react'
import { QrCode as QrCodeIcon, Copy } from 'lucide-react'

interface CreateSuccessProps {
  meetingCode: string
  shareableLink: string
  qrCodeUrl: string
  onCopyCode: () => void
  onCopyLink: () => void
  onStartMeeting: () => void
}

function CreateSuccess({ meetingCode, shareableLink, qrCodeUrl, onCopyCode, onCopyLink, onStartMeeting }: CreateSuccessProps): JSX.Element {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
      <div className="text-center mb-8">
        <div className="bg-accent/20 p-4 rounded-full w-16 h-16 mx-auto mb-4">
          <QrCodeIcon className="w-8 h-8 text-accent mx-auto" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-2">Your meeting is ready!</h1>
        <p className="text-gray-600 dark:text-zinc-400">Share this code or link with participants</p>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
            Meeting Code
          </label>
          <div className="bg-gray-50 dark:bg-zinc-950 border-2 border-dashed border-gray-300 dark:border-zinc-800 rounded-lg p-6">
            <div className="text-4xl font-bold text-primary mb-2">
              {meetingCode}
            </div>
            <button
              onClick={onCopyCode}
              className="flex items-center justify-center mx-auto text-sm text-gray-600 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy Code
            </button>
          </div>
        </div>

        {qrCodeUrl && (
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
              QR Code
            </label>
            <div className="flex justify-center">
              <img
                src={qrCodeUrl}
                alt="QR code to join meeting"
                className="w-48 h-48 border border-gray-200 dark:border-zinc-800 rounded bg-white"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
            Shareable Link
          </label>
          <div className="flex">
            <input
              type="text"
              readOnly
              value={shareableLink}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg bg-gray-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100"
            />
            <button
              onClick={onCopyLink}
              className="px-4 py-3 bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-300 transition-colors dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        <button
          onClick={onStartMeeting}
          className="w-full bg-accent text-white py-3 px-6 rounded-lg font-semibold hover:bg-accent-hover transition-colors"
        >
          Start meeting
        </button>
      </div>
    </div>
  )
}

export default CreateSuccess

