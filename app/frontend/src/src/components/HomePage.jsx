import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Music,
  Upload,
  BarChart3,
  Download,
  Clock,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Users,
  Star
} from 'lucide-react'
import { motion } from 'framer-motion'

const HomePage = ({ onRegister, onLogin }) => {
  const features = [
    {
      icon: Upload,
      title: "Upload Simples",
      description: "Envie seus arquivos de áudio de até 10MB em formatos populares como MP3, WAV, FLAC."
    },
    {
      icon: BarChart3,
      title: "Análise Automática",
      description: "Detectamos automaticamente o BPM e a tonalidade dos seus áudios usando algoritmos avançados."
    },
    {
      icon: Download,
      title: "Gerenciamento Completo",
      description: "Organize, visualize e baixe todos os seus uploads em um dashboard intuitivo."
    },
    {
      icon: Clock,
      title: "Processamento Rápido",
      description: "Análise em tempo real com resultados precisos em segundos."
    },
    {
      icon: Shield,
      title: "Seguro e Privado",
      description: "Seus arquivos são protegidos e apenas você tem acesso aos seus uploads."
    },
    {
      icon: Zap,
      title: "Interface Moderna",
      description: "Design responsivo e intuitivo para uma experiência perfeita em qualquer dispositivo."
    }
  ]

  const steps = [
    {
      number: "01",
      title: "Cadastre-se",
      description: "Crie sua conta gratuita em segundos"
    },
    {
      number: "02",
      title: "Faça Upload",
      description: "Envie seus arquivos de áudio"
    },
    {
      number: "03",
      title: "Obtenha Análise",
      description: "Receba BPM e tonalidade automaticamente"
    },
    {
      number: "04",
      title: "Gerencie",
      description: "Organize e acesse seus arquivos"
    }
  ]

  const testimonials = [
    {
      name: "Carlos Silva",
      role: "Produtor Musical",
      content: "O RegistraSom revolucionou meu workflow. Agora posso analisar dezenas de faixas em minutos!",
      rating: 5
    },
    {
      name: "Ana Santos",
      role: "DJ Profissional",
      content: "Perfeito para organizar minha biblioteca musical. A detecção de BPM é extremamente precisa.",
      rating: 5
    },
    {
      name: "João Oliveira",
      role: "Músico Independente",
      content: "Interface simples e resultados confiáveis. Exatamente o que eu precisava para meus projetos.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              🎵 Análise de Áudio Profissional
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Descubra o{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                BPM e Tom
              </span>
              <br />
              dos seus áudios
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Plataforma completa para análise automática de arquivos de áudio.
              Upload, análise e gerenciamento em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={onRegister}
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 h-auto font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={onLogin}
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 h-auto font-semibold transition-all duration-300"
              >
                <Play className="mr-2 h-5 w-5" />
                Ver Demo
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-300/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-300/20 rounded-full blur-xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              Funcionalidades
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Tudo que você precisa para
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> analisar áudio</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ferramentas profissionais para músicos, produtores e DJs que precisam de análise precisa e rápida.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:scale-105 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
              Como Funciona
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Simples em
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> 4 passos</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Do upload à análise completa, nosso processo é intuitivo e eficiente.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl shadow-lg">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 -z-10"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
              Depoimentos
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              O que nossos
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> usuários dizem</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-gray-600 text-sm">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Pronto para começar?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de músicos e produtores que já usam o RegistraSom para analisar seus áudios.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onRegister}
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 h-auto font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Users className="mr-2 h-5 w-5" />
                Criar Conta Gratuita
              </Button>
              <Button
                onClick={onLogin}
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 h-auto font-semibold transition-all duration-300"
              >
                Já tenho conta
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Music className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">RegistraSom</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Plataforma profissional para análise de áudio. Detecte BPM e tonalidade com precisão e organize sua biblioteca musical.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RegistraSom. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
