import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Music, Menu, X, User, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Navigation = ({ user, onLogin, onLogout, onRegister, currentPage, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleNavigation = (page) => {
    onNavigate(page)
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handleNavigation('home')}
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Music className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              RegistraSom
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavigation('home')}
              className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'home' ? 'text-blue-600 bg-blue-50' : ''
              }`}
            >
              Início
            </button>
            <button
              onClick={() => handleNavigation('features')}
              className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'features' ? 'text-blue-600 bg-blue-50' : ''
              }`}
            >
              Funcionalidades
            </button>
            <button
              onClick={() => handleNavigation('about')}
              className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'about' ? 'text-blue-600 bg-blue-50' : ''
              }`}
            >
              Sobre
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => handleNavigation('dashboard')}
                  variant={currentPage === 'dashboard' ? 'default' : 'outline'}
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  onClick={onLogin}
                  variant="ghost"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Entrar
                </Button>
                <Button
                  onClick={onRegister}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Cadastrar
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              onClick={toggleMenu}
              variant="ghost"
              size="sm"
              className="text-gray-700"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => handleNavigation('home')}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  currentPage === 'home'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Início
              </button>
              <button
                onClick={() => handleNavigation('features')}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  currentPage === 'features'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Funcionalidades
              </button>
              <button
                onClick={() => handleNavigation('about')}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  currentPage === 'about'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Sobre
              </button>

              {user ? (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Olá, {user.name}!
                  </div>
                  <button
                    onClick={() => handleNavigation('dashboard')}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      currentPage === 'dashboard'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={onLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                  <Button
                    onClick={onLogin}
                    variant="outline"
                    className="w-full"
                  >
                    Entrar
                  </Button>
                  <Button
                    onClick={onRegister}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Cadastrar
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navigation
