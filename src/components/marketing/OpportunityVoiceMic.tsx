import { useEffect, useRef, useState } from 'react'
import { Loader2, Mic, Square } from 'lucide-react'
import { parseOpportunityVoice, type OpportunityProfile } from '../../lib/aiToolsApi'

type SpeechRec = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((event: { error?: string }) => void) | null
  onend: (() => void) | null
}

type Props = {
  onFilled: (profile: OpportunityProfile) => void
  disabled?: boolean
}

const MAX_MS = 40_000

function pickRecorderMime(): string {
  if (typeof MediaRecorder === 'undefined') return ''
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus'
  if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm'
  if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4'
  return ''
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(new Error('Could not read the recording'))
    reader.readAsDataURL(blob)
  })
}

export function OpportunityVoiceMic({ onFilled, disabled }: Props) {
  const [listening, setListening] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [liveText, setLiveText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRec | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)
  const transcriptRef = useRef('')
  const finishingRef = useRef(false)

  useEffect(() => {
    return () => {
      stopHardware()
    }
  }, [])

  function clearTimer() {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function stopRecognition() {
    try {
      recognitionRef.current?.stop()
    } catch {
      // already stopped
    }
    recognitionRef.current = null
  }

  function releaseStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  function stopHardware() {
    clearTimer()
    stopRecognition()
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    recorderRef.current = null
    releaseStream()
  }

  async function collectAudio(): Promise<{ audioBase64?: string; mimeType?: string }> {
    const recorder = recorderRef.current
    const mimeType = recorder?.mimeType || pickRecorderMime() || 'audio/webm'
    if (recorder && recorder.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve()
        recorder.stop()
      })
    }
    recorderRef.current = null
    releaseStream()
    const chunks = chunksRef.current
    if (chunks.length === 0) return {}
    const blob = new Blob(chunks, { type: mimeType })
    if (blob.size < 800) return {}
    return { audioBase64: await blobToBase64(blob), mimeType: mimeType.split(';')[0] }
  }

  async function finishAndParse() {
    if (finishingRef.current) return
    finishingRef.current = true
    clearTimer()
    stopRecognition()
    setListening(false)
    setParsing(true)
    setError(null)

    try {
      const audio = await collectAudio()
      const transcript = transcriptRef.current.trim()
      if (!transcript && !audio.audioBase64) {
        throw new Error('No speech captured. Tap the mic and try again.')
      }
      const profile = await parseOpportunityVoice({
        transcript: transcript || undefined,
        audioBase64: audio.audioBase64,
        mimeType: audio.mimeType,
      })
      onFilled(profile)
      setLiveText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read your voice note')
    } finally {
      setParsing(false)
      finishingRef.current = false
      chunksRef.current = []
      transcriptRef.current = ''
    }
  }

  async function startListening() {
    setError(null)
    setLiveText('')
    transcriptRef.current = ''
    chunksRef.current = []

    const SpeechCtor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRec }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRec }).webkitSpeechRecognition

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mime = pickRecorderMime()
      if (mime) {
        const recorder = new MediaRecorder(stream, { mimeType: mime })
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data)
        }
        recorder.start(400)
        recorderRef.current = recorder
      }
    } catch {
      setError('Microphone permission is needed to speak your profile.')
      return
    }

    if (SpeechCtor) {
      const recognition = new SpeechCtor()
      recognition.lang = 'en-IN'
      recognition.continuous = true
      recognition.interimResults = true
      recognition.onresult = (event) => {
        const parts: string[] = []
        for (let i = 0; i < event.results.length; i += 1) {
          const alt = event.results[i]?.[0]?.transcript
          if (alt) parts.push(alt)
        }
        const next = parts.join(' ').trim()
        transcriptRef.current = next
        setLiveText(next)
      }
      recognition.onerror = () => {
        // MediaRecorder still has the clip for Gemini
      }
      recognition.onend = () => {
        // wait for the user tap / timer to finish
      }
      try {
        recognition.start()
        recognitionRef.current = recognition
      } catch {
        recognitionRef.current = null
      }
    }

    setListening(true)
    timerRef.current = window.setTimeout(() => {
      void finishAndParse()
    }, MAX_MS)
  }

  function handleToggle() {
    if (parsing || disabled) return
    if (listening) {
      void finishAndParse()
      return
    }
    void startListening()
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-white px-4 py-4">
      <button
        type="button"
        onClick={handleToggle}
        disabled={parsing || disabled}
        className={`w-full flex items-center gap-3 text-left rounded-xl px-2 py-1 transition-colors disabled:opacity-60 ${
          listening ? 'bg-rose-50' : 'hover:bg-indigo-50/70'
        }`}
      >
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white ${
            listening ? 'bg-rose-500 animate-pulse' : parsing ? 'bg-indigo-400' : 'bg-indigo-600'
          }`}
        >
          {parsing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : listening ? (
            <Square className="w-4 h-4 fill-current" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-gray-800">
            {parsing ? 'Gemini is filling your profile…' : listening ? 'Listening — tap to stop' : 'Speak your profile'}
          </span>
          <span className="block text-xs text-gray-500 mt-0.5">
            Hindi or English · stream, year, skills, what you want
          </span>
        </span>
      </button>
      {liveText && (
        <p className="mt-3 text-xs text-gray-600 leading-relaxed rounded-xl bg-indigo-50/80 px-3 py-2">
          “{liveText}”
        </p>
      )}
      {error && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
