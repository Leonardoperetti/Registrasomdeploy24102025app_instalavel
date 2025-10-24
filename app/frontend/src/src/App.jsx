import { useState, useEffect } from 'react'
import Navigation from './components/Navigation'
import HomePage from './components/HomePage'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  // Verificar se há um usuário logado ao carregar a aplicação
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setToken(savedToken)
        setUser(userData)
        setCurrentPage('dashboard')
      } catch (error) {
        // Se houver erro ao parsear, limpar o localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  const handleLogin = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    setCurrentPage('dashboard')
  }

  const handleRegister = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
    setCurrentPage('home')
  }

  const handleNavigation = (page) => {
    setCurrentPage(page)
  }

  const showLoginForm = () => {
    setCurrentPage('login')
  }

  const showRegisterForm = () => {
    setCurrentPage('register')
  }

  const goBackToHome = () => {
    setCurrentPage('home')
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <LoginForm
            onLogin={handleLogin}
            onSwitchToRegister={showRegisterForm}
            onBack={goBackToHome}
          />
        )
      case 'register':
        return (
          <RegisterForm
            onRegister={handleRegister}
            onSwitchToLogin={showLoginForm}
            onBack={goBackToHome}
          />
        )
      case 'dashboard':
        return user ? (
          <Dashboard
            user={user}
            token={token}
            onLogout={handleLogout}
          />
        ) : (
          <HomePage
            onRegister={showRegisterForm}
            onLogin={showLoginForm}
          />
        )
      case 'features':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Navigation
              user={user}
              onLogin={showLoginForm}
              onLogout={handleLogout}
              onRegister={showRegisterForm}
              currentPage={currentPage}
              onNavigate={handleNavigation}
            />
            <div className="max-w-4xl mx-auto px-4 py-16">
              <h1 className="text-4xl font-bold text-center mb-8">Funcionalidades</h1>
              <p className="text-lg text-gray-600 text-center">
                Página de funcionalidades em desenvolvimento...
              </p>
            </div>
          </div>
        )
      case 'about':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Navigation
              user={user}
              onLogin={showLoginForm}
              onLogout={handleLogout}
              onRegister={showRegisterForm}
              currentPage={currentPage}
              onNavigate={handleNavigation}
            />
            <div className="max-w-4xl mx-auto px-4 py-16">
              <h1 className="text-4xl font-bold text-center mb-8">Sobre o RegistraSom</h1>
              <div className="prose prose-lg mx-auto">
                <p className="text-lg text-gray-600">
                  O RegistraSom é uma plataforma inovadora para análise automática de arquivos de áudio.
                  Nossa missão é fornecer ferramentas profissionais e acessíveis para músicos, produtores
                  e DJs que precisam de análise precisa e rápida de suas faixas musicais.
                </p>
                <p className="text-lg text-gray-600 mt-4">
                  Utilizamos algoritmos avançados de processamento de áudio para detectar automaticamente
                  o BPM (batidas por minuto) e a tonalidade de suas músicas, permitindo uma organização
                  mais eficiente de sua biblioteca musical.
                </p>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <>
            <Navigation
              user={user}
              onLogin={showLoginForm}
              onLogout={handleLogout}
              onRegister={showRegisterForm}
              currentPage={currentPage}
              onNavigate={handleNavigation}
            />
            <HomePage
              onRegister={showRegisterForm}
              onLogin={showLoginForm}
            />
          </>
        )
    }
  }

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  )
}

export default App
