import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward,
  Loader2 
} from 'lucide-react'
import { motion } from 'framer-motion'

const AudioPlayer = ({ audioId, filename, token, onError }) => {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState('')
  const [seekInput, setSeekInput] = useState('')

  // URL do áudio com autenticação
  const audioUrl = `/api/audio/${audioId}/stream`

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleError = (e) => {
      setIsLoading(false)
      setError('Erro ao carregar áudio')
      onError && onError('Erro ao carregar áudio')
    }
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [onError])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        await audio.play()
        setIsPlaying(true)
      }
    } catch (err) {
      setError('Erro ao reproduzir áudio')
      onError && onError('Erro ao reproduzir áudio')
    }
  }

  const handleSeek = (value) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = (value[0] / 100) * duration
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = value[0] / 100
    audio.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  const skipTime = (seconds) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleJumpToTime = () => {
    const audio = audioRef.current
    if (!audio || !seekInput) return

    const timeInSeconds = parseFloat(seekInput)
    if (isNaN(timeInSeconds) || timeInSeconds < 0 || timeInSeconds > duration) {
      setError('Tempo inválido. Por favor, insira um valor em segundos dentro da duração do áudio.')
      return
    }
    audio.currentTime = timeInSeconds
    setCurrentTime(timeInSeconds)
    setSeekInput('') // Limpar o input após pular
    setError('')
  }



  const formatTime = (time) => {
    if (isNaN(time)) return '0:00'
    
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          crossOrigin="use-credentials"
        />
        
        <div className="space-y-4">
          {/* Título do arquivo */}
          <div className="text-center">
            <h4 className="font-medium text-gray-900 truncate" title={filename}>
              {filename}
            </h4>
          </div>

          {/* Controles principais */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => skipTime(-10)}
              disabled={isLoading}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              onClick={togglePlay}
              disabled={isLoading}
              className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => skipTime(10)}
              disabled={isLoading}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Barra de progresso */}
          <div className="space-y-2">
            <Slider
              value={[progressPercentage]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
              disabled={isLoading || duration === 0}
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Pular para tempo específico */}
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Segundos"
              value={seekInput}
              onChange={(e) => setSeekInput(e.target.value)}
              className="w-24 p-1 border rounded text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleJumpToTime}
              disabled={isLoading || duration === 0 || !seekInput}
            >
              Pular para
            </Button>
          </div>

          {/* Controle de volume */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="p-1"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="flex-1 max-w-24"
            />
          </div>

          {/* Indicador de erro */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-red-600 bg-red-50 p-2 rounded"
            >
              {error}
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default AudioPlayer
