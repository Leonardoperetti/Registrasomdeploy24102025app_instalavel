import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Upload,
  Music,
  BarChart3,
  Download,
  Trash2,
  RefreshCw,
  Play,
  Pause,
  Clock,
  FileAudio,
  TrendingUp,
  User,
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Plus
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import MusicRegistration from './MusicRegistration'
import AudioPlayer from './AudioPlayer'

const Dashboard = ({ user, token, onLogout }) => {
  const [uploads, setUploads] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [showSpectrum, setShowSpectrum] = useState(null) // null, or audio.id
  const [showTranscription, setShowTranscription] = useState(null) // null, or audio.id
  const [transcriptionData, setTranscriptionData] = useState({}) // {audioId: transcriptionText}
  const [showMusicRegistration, setShowMusicRegistration] = useState(false)

  useEffect(() => {
    fetchUploads()
    fetchStats()
  }, [currentPage])

  const fetchUploads = async () => {
    try {
      const response = await fetch(`/api/my-uploads?page=${currentPage}&per_page=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUploads(data.audios)
        setTotalPages(data.pages)
      } else {
        setError('Erro ao carregar uploads')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        // Handle error if needed
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validar tamanho do arquivo (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo permitido: 10MB')
      return
    }

    // Validar tipo de arquivo
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/aac', 'audio/ogg']
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de arquivo não suportado. Use MP3, WAV, FLAC, M4A, AAC ou OGG')
      return
    }

    setUploadLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('audio', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setUploads(prev => [data.audio, ...prev])
        fetchStats() // Atualizar estatísticas
        event.target.value = '' // Limpar input
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao fazer upload')
      }
    } catch (err) {
      setError('Erro de conexão durante o upload')
    } finally {
      setUploadLoading(false)
    }
  }

  const handleDelete = async (audioId) => {
    if (!confirm('Tem certeza que deseja excluir este áudio?')) return

    try {
      const response = await fetch(`/api/audio/${audioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setUploads(prev => prev.filter(audio => audio.id !== audioId))
        fetchStats() // Atualizar estatísticas
      } else {
        setError('Erro ao excluir áudio')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const handleReanalyze = async (audioId) => {
    try {
      const response = await fetch(`/api/audio/${audioId}/reanalyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Atualizar o status do áudio na lista
        setUploads(prev => prev.map(audio =>
          audio.id === audioId
            ? { ...audio, status: 'pending', bpm: null, key: null }
            : audio
        ))
      } else {
        setError('Erro ao reprocessar áudio')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendente', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800', text: 'Processando', icon: Loader2 },
      completed: { color: 'bg-green-100 text-green-800', text: 'Concluído', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', text: 'Falhou', icon: XCircle }
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    )
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewTranscription = async (audioId) => {
    try {
      // Se já temos a transcrição carregada, apenas alternar a exibição
      if (transcriptionData[audioId]) {
        setShowTranscription(showTranscription === audioId ? null : audioId)
        return
      }

      // Buscar transcrição do servidor
      const response = await fetch(`/api/audio/${audioId}/transcription`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTranscriptionData(prev => ({
          ...prev,
          [audioId]: data.transcription || 'Transcrição não disponível'
        }))
        setShowTranscription(audioId)
      } else {
        setError('Erro ao carregar transcrição')
      }
    } catch (err) {
      setError('Erro de conexão ao carregar transcrição')
    }
  }

  const handleDownloadTranscriptionPDF = (audioId, originalFilename) => {
    window.open(`/api/audio/${audioId}/transcription/pdf`, "_blank")
  }

  const renderFrequencySpectrum = (spectrumData) => {
    try {
      const data = JSON.parse(spectrumData)
      // Reduzir o número de pontos para melhor visualização (agrupar em bins)
      const binSize = Math.ceil(data.length / 50)
      const binnedData = []

      for (let i = 0; i < data.length; i += binSize) {
        const bin = data.slice(i, i + binSize)
        const avgAmplitude = bin.reduce((sum, val) => sum + val, 0) / bin.length
        binnedData.push({
          frequency: Math.floor(i / binSize),
          amplitude: avgAmplitude.toFixed(2)
        })
      }

      return binnedData
    } catch (err) {
      console.error('Erro ao processar espectro de frequência:', err)
      return []
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  // Se estiver mostrando o registro de música, renderizar apenas esse componente
  if (showMusicRegistration) {
    return (
      <MusicRegistration 
        user={user} 
        token={token} 
        onBack={() => setShowMusicRegistration(false)} 
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Bem-vindo, {user.name}!
                </h1>
                <p className="text-gray-600">
                  Gerencie seus uploads de áudio e visualize as análises
                </p>
              </div>
              <Button 
                onClick={() => setShowMusicRegistration(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Criar Registro
              </Button>
            </div>
          </motion.div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Erro:</strong>
            <span className="block sm:inline"> {error}</span>
          </motion.div>
        )}

        <Tabs defaultValue="uploads" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="uploads" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Uploads</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Estatísticas</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Perfil</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="uploads">
            {/* Upload Area */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Fazer Upload de Áudio</span>
                </CardTitle>
                <CardDescription>Envie seus arquivos de áudio para análise.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    {uploadLoading ? (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Loader2 className="w-8 h-8 mb-3 text-gray-500 animate-spin" />
                        <p className="mb-2 text-sm text-gray-500">Processando...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-4 text-gray-500"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                        </p>
                        <p className="text-xs text-gray-500">MP3, WAV, FLAC, M4A, AAC, OGG (MAX. 10MB)</p>
                      </div>
                    )}
                    <input id="dropzone-file" type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Uploads List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Music className="h-5 w-5" />
                    <span>Seus Uploads</span>
                  </div>
                  <Button
                    onClick={fetchUploads}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Atualizar</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {uploads.length === 0 ? (
                  <div className="text-center py-8">
                    <FileAudio className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum upload encontrado</p>
                    <p className="text-sm text-gray-400">Faça seu primeiro upload acima</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {uploads.map((audio) => (
                        <motion.div
                          key={audio.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-medium text-gray-900">
                                  {audio.original_filename}
                                </h3>
                                {getStatusBadge(audio.status)}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Tamanho:</span> {formatFileSize(audio.filesize)}
                                </div>
                                <div>
                                  <span className="font-medium">Upload:</span> {formatDate(audio.uploaded_at)}
                                </div>
                                <div>
                                  <span className="font-medium">BPM:</span> {audio.bpm ? Math.round(audio.bpm) : '-'}
                                </div>
                                <div>
                                  <span className="font-medium">Tom:</span> {audio.key || '-'}
                                </div>
                                <div>
                                  <span className="font-medium">LUFS:</span> {audio.lufs ? `${audio.lufs.toFixed(2)} LUFS` : '-'}
                                </div>
                                <div>
                                  <span className="font-medium">Espectro:</span> {audio.frequency_spectrum ? (
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="p-0 h-auto text-blue-600"
                                      onClick={() => setShowSpectrum(showSpectrum === audio.id ? null : audio.id)}
                                    >
                                      {showSpectrum === audio.id ? 'Ocultar' : 'Visualizar'}
                                    </Button>
                                  ) : '-'}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 mt-4 md:mt-0 md:ml-4">
                              {audio.status === 'completed' && (
                                <>
                                  <Button
                                    onClick={() => window.open(`/api/audio/${audio.id}/download`, '_blank')}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleViewTranscription(audio.id)}
                                    variant="outline"
                                    size="sm"
                                    title="Ver transcrição"
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDownloadTranscriptionPDF(audio.id, audio.original_filename)}
                                    variant="outline"
                                    size="sm"
                                    title="Baixar PDF da Transcrição"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {audio.status === 'failed' && (
                                <Button
                                  onClick={() => handleReanalyze(audio.id)}
                                  variant="outline"
                                  size="sm"
                                  title="Tentar reanalisar"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                onClick={() => handleDelete(audio.id)}
                                variant="destructive"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Audio Player */}
                          <div className="w-full mt-4">
                            <AudioPlayer 
                              audioId={audio.id} 
                              filename={audio.original_filename} 
                              token={token} 
                              onError={(error) => setError(error)} 
                            />
                          </div>

                          {/* Transcrição */}
                          <AnimatePresence>
                            {showTranscription === audio.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-700 whitespace-pre-wrap"
                              >
                                <h4 className="font-semibold mb-2">Transcrição:</h4>
                                {transcriptionData[audio.id] || "Carregando..."}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Espectro de Frequência */}
                          <AnimatePresence>
                            {showSpectrum === audio.id && audio.frequency_spectrum && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 p-4 bg-gray-50 rounded-md"
                              >
                                <h4 className="font-semibold mb-2">Espectro de Frequência:</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                  <BarChart data={renderFrequencySpectrum(audio.frequency_spectrum)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="frequency" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="amplitude" fill="#8884d8" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-4 space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Anterior
                        </Button>
                        {[...Array(totalPages)].map((_, index) => (
                          <Button
                            key={index + 1}
                            variant={currentPage === index + 1 ? "default" : "outline"}
                            onClick={() => setCurrentPage(index + 1)}
                          >
                            {index + 1}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Próxima
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Estatísticas de Uso</span>
                </CardTitle>
                <CardDescription>Visão geral dos seus uploads e análises.</CardDescription>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Uploads</CardTitle>
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.total_audios}</div>
                        <p className="text-xs text-muted-foreground">Arquivos de áudio enviados</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Média de BPM</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.average_bpm ? stats.average_bpm.toFixed(2) : '-' }</div>
                        <p className="text-xs text-muted-foreground">Batidas por minuto</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Média de LUFS</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.average_lufs ? stats.average_lufs.toFixed(2) : '-' }</div>
                        <p className="text-xs text-muted-foreground">Loudness Units Full Scale</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Arquivos Processados</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.completed_audios}</div>
                        <p className="text-xs text-muted-foreground">Com análise concluída</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Arquivos Pendentes</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.pending_audios}</div>
                        <p className="text-xs text-muted-foreground">Aguardando processamento</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Arquivos com Falha</CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.failed_audios}</div>
                        <p className="text-xs text-muted-foreground">Falha na análise</p>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhuma estatística disponível.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Perfil do Usuário</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Nome:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <Button onClick={onLogout} className="mt-4">Sair</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Dashboard

