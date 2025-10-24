import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Upload,
  Music,
  FileText,
  FileCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Download,
  Save,
  Eye,
  Calendar,
  User,
  Hash,
  MapPin,
  Phone,
  Mail,
  Building
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const MusicRegistration = ({ user, token, onBack }) => {
  // Estados do formulário
  const [formData, setFormData] = useState({
    titulo: '',
    genero: 'Música',
    dataCreacao: '',
    numerosPaginas: '',
    autores: [{
      nome: '',
      cpf: '',
      pseudonimo: '',
      dataNascimento: '',
      naturalidade: '',
      nacionalidade: 'Brasileira',
      cep: '',
      endereco: '',
      bairro: '',
      cidade: '',
      uf: '',
      telefone: '',
      email: '',
      vinculo: 'Autor(a)',
      assinatura: ''
    }]
  })

  // Estados das abas
  const [letraMusica, setLetraMusica] = useState('')
  const [letraFile, setLetraFile] = useState(null)
  const [contratos, setContratos] = useState([])
  const [audioFile, setAudioFile] = useState(null)

  // Estados do checklist
  const [checklist, setChecklist] = useState({
    tituloMusica: false,
    letraMusica: false,
    arquivoAudio: false,
    identificacaoAutores: false,
    comprovanteAutoria: false,
    declaracaoCoautoria: false,
    dadosContratos: false,
    resumoPendencias: false
  })

  // Estados de UI
  const [activeTab, setActiveTab] = useState('formulario')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // Opções de gênero baseadas no formulário oficial
  const generos = [
    'Música', 'Poema', 'Antologia', 'Conferência', 'Ensaio', 'Mapa', 'Religioso',
    'Argumento (audiovisual)', 'Conto', 'Fotografia', 'Místico/esotérico', 'Romance',
    'Artigo', 'Crônica', 'Guia', 'Monografia', 'Roteiro (audiovisual)',
    'Autobiografia', 'Desenho', 'História em Quadrinhos', 'Novela', 'Teatro',
    'Biografia', 'Design de Website', 'Literatura Infantil', 'Periódico', 'Técnico',
    'Cartaz/folder/panfleto', 'Dicionário', 'Letra de Música', 'Personagem', 'Tese',
    'Comics', 'Didático', 'Livro-jogo (RPG)', 'Outros'
  ]

  // Opções de vínculo com a obra
  const vinculos = [
    'Autor(a)', 'Adaptador(a)', 'Cessionário(a)', 'Tradutor(a)', 'Ilustrador(a)',
    'Organizador(a)', 'Fotógrafo(a)', 'Representante Legal para menores de 18 anos',
    'Cedente', 'Herdeiro', 'Inventariante', 'Editor', 'Titular'
  ]

  // Estados brasileiros
  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('musicRegistration')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        if (parsed.formData) setFormData(parsed.formData)
        if (parsed.letraMusica) setLetraMusica(parsed.letraMusica)
        if (parsed.contratos) setContratos(parsed.contratos)
        if (parsed.checklist) setChecklist(parsed.checklist)
      } catch (err) {
        console.error('Erro ao carregar dados salvos:', err)
      }
    }
  }, [])

  // Atualizar checklist automaticamente
  useEffect(() => {
    updateChecklist()
  }, [formData, letraMusica, letraFile, contratos, audioFile])

  const updateChecklist = () => {
    const newChecklist = {
      tituloMusica: formData.titulo.trim() !== '',
      letraMusica: letraMusica.trim() !== '' || letraFile !== null,
      arquivoAudio: audioFile !== null,
      identificacaoAutores: formData.autores.every(autor => 
        autor.nome.trim() !== '' && autor.cpf.trim() !== ''
      ),
      comprovanteAutoria: formData.autores.every(autor => autor.assinatura.trim() !== ''),
      declaracaoCoautoria: formData.autores.length > 1 ? contratos.length > 0 : true,
      dadosContratos: contratos.length > 0 || formData.autores.length === 1,
      resumoPendencias: false // Será calculado baseado nos outros itens
    }

    // Calcular resumo e pendências
    const completedItems = Object.values(newChecklist).filter(Boolean).length - 1 // -1 para não contar resumoPendencias
    newChecklist.resumoPendencias = completedItems === 7

    setChecklist(newChecklist)
  }

  const handleFormChange = (field, value, autorIndex = null) => {
    if (autorIndex !== null) {
      setFormData(prev => ({
        ...prev,
        autores: prev.autores.map((autor, index) =>
          index === autorIndex ? { ...autor, [field]: value } : autor
        )
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const addAutor = () => {
    setFormData(prev => ({
      ...prev,
      autores: [...prev.autores, {
        nome: '',
        cpf: '',
        pseudonimo: '',
        dataNascimento: '',
        naturalidade: '',
        nacionalidade: 'Brasileira',
        cep: '',
        endereco: '',
        bairro: '',
        cidade: '',
        uf: '',
        telefone: '',
        email: '',
        vinculo: 'Autor(a)',
        assinatura: ''
      }]
    }))
  }

  const removeAutor = (index) => {
    if (formData.autores.length > 1) {
      setFormData(prev => ({
        ...prev,
        autores: prev.autores.filter((_, i) => i !== index)
      }))
    }
  }

  const handleFileUpload = (file, type) => {
    if (type === 'letra') {
      setLetraFile(file)
    } else if (type === 'audio') {
      setAudioFile(file)
    } else if (type === 'contrato') {
      setContratos(prev => [...prev, {
        id: Date.now(),
        file: file,
        name: file.name,
        type: 'Contrato',
        uploadedAt: new Date()
      }])
    }
  }

  const removeContrato = (id) => {
    setContratos(prev => prev.filter(contrato => contrato.id !== id))
  }

  const getProgressPercentage = () => {
    const completedItems = Object.values(checklist).filter(Boolean).length
    return Math.round((completedItems / 8) * 100)
  }

  const getChecklistIcon = (completed) => {
    return completed ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <Clock className="h-4 w-4 text-yellow-600" />
    )
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError('')

    try {
      const registrationData = {
        titulo: formData.titulo,
        genero: formData.genero,
        data_criacao: formData.dataCreacao,
        numero_paginas: parseInt(formData.numerosPaginas) || null,
        letra_texto: letraMusica,
        autores_data: formData.autores,
        contratos_data: contratos.map(c => ({ 
          id: c.id, 
          name: c.name, 
          type: c.type, 
          uploadedAt: c.uploadedAt 
        })),
        checklist_status: checklist,
        status: getProgressPercentage() === 100 ? 'completed' : 'draft'
      }

      const response = await fetch('/api/music-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(registrationData)
      })

      if (response.ok) {
        const result = await response.json()
        
        // Salvar dados no localStorage como backup
        localStorage.setItem('musicRegistration', JSON.stringify({
          formData,
          letraMusica,
          contratos: contratos.map(c => ({ ...c, file: null })),
          checklist,
          registrationId: result.registration.id
        }))

        alert('Registro salvo com sucesso!')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar registro')
      }
    } catch (err) {
      setError('Erro ao salvar registro: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const generatePreview = () => {
    return {
      titulo: formData.titulo,
      genero: formData.genero,
      dataCreacao: formData.dataCreacao,
      autores: formData.autores.filter(autor => autor.nome.trim() !== ''),
      letra: letraMusica || (letraFile ? letraFile.name : ''),
      contratos: contratos.length,
      audio: audioFile ? audioFile.name : '',
      progresso: getProgressPercentage()
    }
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
                  Criar Registro
                </h1>
                <p className="text-gray-600">
                  Sistema de registro de música com checklist jurídico
                </p>
              </div>
              <Button onClick={onBack} variant="outline">
                Voltar ao Dashboard
              </Button>
            </div>

            {/* Progress Bar */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Progresso do Registro
                  </span>
                  <span className="text-sm text-gray-500">
                    {getProgressPercentage()}% concluído
                  </span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="formulario" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Formulário</span>
                </TabsTrigger>
                <TabsTrigger value="letra" className="flex items-center space-x-2">
                  <Music className="h-4 w-4" />
                  <span>Letra da Música</span>
                </TabsTrigger>
                <TabsTrigger value="contratos" className="flex items-center space-x-2">
                  <FileCheck className="h-4 w-4" />
                  <span>Contratos</span>
                </TabsTrigger>
              </TabsList>

              {/* Aba Formulário */}
              <TabsContent value="formulario" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Formulário Inteligente</CardTitle>
                    <CardDescription>
                      Preencha os dados da música e dos autores
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Dados da Obra */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Dados da Obra</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="titulo">Título da Música *</Label>
                          <Input
                            id="titulo"
                            value={formData.titulo}
                            onChange={(e) => handleFormChange('titulo', e.target.value)}
                            placeholder="Digite o título da música"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="genero">Gênero *</Label>
                          <Select value={formData.genero} onValueChange={(value) => handleFormChange('genero', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {generos.map(genero => (
                                <SelectItem key={genero} value={genero}>
                                  {genero}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="dataCreacao">Data de Criação *</Label>
                          <Input
                            id="dataCreacao"
                            type="date"
                            value={formData.dataCreacao}
                            onChange={(e) => handleFormChange('dataCreacao', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="numerosPaginas">Número de Páginas</Label>
                          <Input
                            id="numerosPaginas"
                            type="number"
                            value={formData.numerosPaginas}
                            onChange={(e) => handleFormChange('numerosPaginas', e.target.value)}
                            placeholder="Ex: 3"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Identificação dos Autores */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Identificação dos Autores</h3>
                        <Button onClick={addAutor} variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Autor
                        </Button>
                      </div>

                      {formData.autores.map((autor, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-gray-900">
                              Autor {index + 1}
                            </h4>
                            {formData.autores.length > 1 && (
                              <Button
                                onClick={() => removeAutor(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <Label>Nome Civil / Razão Social *</Label>
                              <Input
                                value={autor.nome}
                                onChange={(e) => handleFormChange('nome', e.target.value, index)}
                                placeholder="Nome completo"
                              />
                            </div>

                            <div>
                              <Label>CPF/CNPJ *</Label>
                              <Input
                                value={autor.cpf}
                                onChange={(e) => handleFormChange('cpf', e.target.value, index)}
                                placeholder="000.000.000-00"
                              />
                            </div>

                            <div>
                              <Label>Pseudônimo</Label>
                              <Input
                                value={autor.pseudonimo}
                                onChange={(e) => handleFormChange('pseudonimo', e.target.value, index)}
                                placeholder="Nome artístico"
                              />
                            </div>

                            <div>
                              <Label>Data de Nascimento</Label>
                              <Input
                                type="date"
                                value={autor.dataNascimento}
                                onChange={(e) => handleFormChange('dataNascimento', e.target.value, index)}
                              />
                            </div>

                            <div>
                              <Label>Naturalidade</Label>
                              <Input
                                value={autor.naturalidade}
                                onChange={(e) => handleFormChange('naturalidade', e.target.value, index)}
                                placeholder="Cidade de nascimento"
                              />
                            </div>

                            <div>
                              <Label>Nacionalidade</Label>
                              <Input
                                value={autor.nacionalidade}
                                onChange={(e) => handleFormChange('nacionalidade', e.target.value, index)}
                                placeholder="Brasileira"
                              />
                            </div>

                            <div>
                              <Label>CEP</Label>
                              <Input
                                value={autor.cep}
                                onChange={(e) => handleFormChange('cep', e.target.value, index)}
                                placeholder="00000-000"
                              />
                            </div>

                            <div>
                              <Label>Endereço Completo</Label>
                              <Input
                                value={autor.endereco}
                                onChange={(e) => handleFormChange('endereco', e.target.value, index)}
                                placeholder="Rua, número, complemento"
                              />
                            </div>

                            <div>
                              <Label>Bairro</Label>
                              <Input
                                value={autor.bairro}
                                onChange={(e) => handleFormChange('bairro', e.target.value, index)}
                                placeholder="Nome do bairro"
                              />
                            </div>

                            <div>
                              <Label>Cidade</Label>
                              <Input
                                value={autor.cidade}
                                onChange={(e) => handleFormChange('cidade', e.target.value, index)}
                                placeholder="Nome da cidade"
                              />
                            </div>

                            <div>
                              <Label>UF</Label>
                              <Select value={autor.uf} onValueChange={(value) => handleFormChange('uf', value, index)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                  {estados.map(estado => (
                                    <SelectItem key={estado} value={estado}>
                                      {estado}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Telefone</Label>
                              <Input
                                value={autor.telefone}
                                onChange={(e) => handleFormChange('telefone', e.target.value, index)}
                                placeholder="(00) 00000-0000"
                              />
                            </div>

                            <div>
                              <Label>E-mail</Label>
                              <Input
                                type="email"
                                value={autor.email}
                                onChange={(e) => handleFormChange('email', e.target.value, index)}
                                placeholder="email@exemplo.com"
                              />
                            </div>

                            <div>
                              <Label>Vínculo com a Obra</Label>
                              <Select value={autor.vinculo} onValueChange={(value) => handleFormChange('vinculo', value, index)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {vinculos.map(vinculo => (
                                    <SelectItem key={vinculo} value={vinculo}>
                                      {vinculo}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="md:col-span-2">
                              <Label>Assinatura Digital</Label>
                              <Input
                                value={autor.assinatura}
                                onChange={(e) => handleFormChange('assinatura', e.target.value, index)}
                                placeholder="Digite seu nome completo como assinatura"
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Letra da Música */}
              <TabsContent value="letra" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Letra da Música</CardTitle>
                    <CardDescription>
                      Adicione a letra através de upload ou editor de texto
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Upload de arquivo */}
                    <div>
                      <Label>Upload de Arquivo (PDF ou DOC)</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e.target.files[0], 'letra')}
                          className="hidden"
                          id="letra-upload"
                        />
                        <label htmlFor="letra-upload" className="cursor-pointer">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {letraFile ? letraFile.name : 'Clique para selecionar um arquivo'}
                          </p>
                        </label>
                      </div>
                    </div>

                    <div className="text-center text-gray-500">ou</div>

                    {/* Editor de texto */}
                    <div>
                      <Label>Editor de Texto Integrado</Label>
                      <Textarea
                        value={letraMusica}
                        onChange={(e) => setLetraMusica(e.target.value)}
                        placeholder="Digite ou cole a letra da música aqui..."
                        className="min-h-[300px] mt-2"
                      />
                    </div>

                    {/* Upload de áudio */}
                    <div>
                      <Label>Arquivo de Áudio</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleFileUpload(e.target.files[0], 'audio')}
                          className="hidden"
                          id="audio-upload"
                        />
                        <label htmlFor="audio-upload" className="cursor-pointer">
                          <Music className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {audioFile ? audioFile.name : 'Clique para selecionar um arquivo de áudio'}
                          </p>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Contratos */}
              <TabsContent value="contratos" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contratos e Declarações</CardTitle>
                    <CardDescription>
                      Upload de contratos, declarações de coautoria e documentos legais
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Upload de contratos */}
                    <div>
                      <Label>Adicionar Documento</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e.target.files[0], 'contrato')}
                          className="hidden"
                          id="contrato-upload"
                        />
                        <label htmlFor="contrato-upload" className="cursor-pointer">
                          <FileCheck className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            Clique para adicionar contrato ou declaração
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PDF, DOC, DOCX, JPG, PNG
                          </p>
                        </label>
                      </div>
                    </div>

                    {/* Lista de contratos */}
                    {contratos.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Documentos Adicionados</h4>
                        {contratos.map((contrato) => (
                          <div key={contrato.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileCheck className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium text-gray-900">{contrato.name}</p>
                                <p className="text-sm text-gray-500">
                                  Adicionado em {contrato.uploadedAt.toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => removeContrato(contrato.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Checklist e Preview */}
          <div className="space-y-6">
            {/* Checklist Jurídico */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Checklist Jurídico</CardTitle>
                <CardDescription>
                  Acompanhe o progresso do seu registro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  {getChecklistIcon(checklist.tituloMusica)}
                  <span className="text-sm">Título da música</span>
                </div>
                <div className="flex items-center space-x-3">
                  {getChecklistIcon(checklist.letraMusica)}
                  <span className="text-sm">Letra da música</span>
                </div>
                <div className="flex items-center space-x-3">
                  {getChecklistIcon(checklist.arquivoAudio)}
                  <span className="text-sm">Arquivo de áudio</span>
                </div>
                <div className="flex items-center space-x-3">
                  {getChecklistIcon(checklist.identificacaoAutores)}
                  <span className="text-sm">Identificação dos autores</span>
                </div>
                <div className="flex items-center space-x-3">
                  {getChecklistIcon(checklist.comprovanteAutoria)}
                  <span className="text-sm">Comprovante da autoria</span>
                </div>
                <div className="flex items-center space-x-3">
                  {getChecklistIcon(checklist.declaracaoCoautoria)}
                  <span className="text-sm">Declaração de coautoria</span>
                </div>
                <div className="flex items-center space-x-3">
                  {getChecklistIcon(checklist.dadosContratos)}
                  <span className="text-sm">Dados de contratos</span>
                </div>
                <div className="flex items-center space-x-3">
                  {getChecklistIcon(checklist.resumoPendencias)}
                  <span className="text-sm">Resumo e pendências</span>
                </div>
              </CardContent>
            </Card>

            {/* Formulário Preenchido Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Formulário Preenchido</CardTitle>
                <CardDescription>
                  Prévia dos dados inseridos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Título da Música</span>
                  <p className="text-gray-600">{formData.titulo || 'Não informado'}</p>
                </div>
                <div>
                  <span className="font-medium">Gênero</span>
                  <p className="text-gray-600">{formData.genero}</p>
                </div>
                <div>
                  <span className="font-medium">Data de Criação</span>
                  <p className="text-gray-600">
                    {formData.dataCreacao ? new Date(formData.dataCreacao).toLocaleDateString('pt-BR') : 'Não informado'}
                  </p>
                </div>
                {formData.autores.filter(autor => autor.nome.trim() !== '').map((autor, index) => (
                  <div key={index}>
                    <span className="font-medium">Autor {index + 1}</span>
                    <p className="text-gray-600">{autor.nome}</p>
                    <p className="text-xs text-gray-500">CPF: {autor.cpf || 'Não informado'}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Resumo e Pendências */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo e Pendências</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progresso</span>
                    <Badge variant={getProgressPercentage() === 100 ? "default" : "secondary"}>
                      {Object.values(checklist).filter(Boolean).length}/8 Concluído
                    </Badge>
                  </div>
                  
                  {getProgressPercentage() < 100 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Pendências:</p>
                      {Object.entries(checklist).map(([key, completed]) => {
                        if (!completed) {
                          const labels = {
                            tituloMusica: 'Título da música',
                            letraMusica: 'Letra da música',
                            arquivoAudio: 'Arquivo de áudio',
                            identificacaoAutores: 'Identificação dos autores',
                            comprovanteAutoria: 'Comprovante da autoria',
                            declaracaoCoautoria: 'Declaração de coautoria',
                            dadosContratos: 'Dados de contratos',
                            resumoPendencias: 'Resumo e pendências'
                          }
                          return (
                            <div key={key} className="flex items-center space-x-2">
                              <AlertCircle className="h-3 w-3 text-yellow-600" />
                              <span className="text-xs text-gray-600">{labels[key]}</span>
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="space-y-3">
              <Button 
                onClick={handleSave} 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Registro
                  </>
                )}
              </Button>
              
              <Button 
                onClick={() => setShowPreview(!showPreview)} 
                variant="outline" 
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Ocultar' : 'Visualizar'} Prévia
              </Button>

              {getProgressPercentage() === 100 && (
                <Button variant="default" className="w-full bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF Final
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Prévia do Formulário</h3>
                  <Button onClick={() => setShowPreview(false)} variant="ghost" size="sm">
                    ×
                  </Button>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="border-b pb-2">
                    <h4 className="font-medium">Dados da Obra</h4>
                    <p><strong>Título:</strong> {formData.titulo || 'Não informado'}</p>
                    <p><strong>Gênero:</strong> {formData.genero}</p>
                    <p><strong>Data de Criação:</strong> {formData.dataCreacao || 'Não informado'}</p>
                  </div>
                  
                  <div className="border-b pb-2">
                    <h4 className="font-medium">Autores</h4>
                    {formData.autores.filter(autor => autor.nome.trim() !== '').map((autor, index) => (
                      <div key={index} className="ml-4 mb-2">
                        <p><strong>Nome:</strong> {autor.nome}</p>
                        <p><strong>CPF:</strong> {autor.cpf}</p>
                        <p><strong>Vínculo:</strong> {autor.vinculo}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-b pb-2">
                    <h4 className="font-medium">Anexos</h4>
                    <p><strong>Letra:</strong> {letraMusica ? 'Texto inserido' : letraFile ? letraFile.name : 'Não informado'}</p>
                    <p><strong>Áudio:</strong> {audioFile ? audioFile.name : 'Não informado'}</p>
                    <p><strong>Contratos:</strong> {contratos.length} documento(s)</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Status</h4>
                    <p><strong>Progresso:</strong> {getProgressPercentage()}% concluído</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default MusicRegistration
