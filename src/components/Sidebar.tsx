import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserCircle, Users, Brain, Languages, LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import MatrixChat from './MatrixChat';

const navigation = {
  en: [
    { name: 'Residents', to: '/residents', icon: UserCircle },
    { name: 'Groups', to: '/groups', icon: Users },
    { name: 'LLM Models', to: '/models', icon: Brain },
  ],
  zh: [
    { name: '居民', to: '/residents', icon: UserCircle },
    { name: '群组', to: '/groups', icon: Users },
    { name: 'LLM 模型', to: '/models', icon: Brain },
  ],
};

export default function Sidebar() {
  const { language, setLanguage } = useLanguage();
  const { logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <div className="h-full bg-white border-r border-gray-200 px-4 py-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <img src="/src/assets/bihua.png" alt="Bihua" className="h-8 w-8" />
          <span className="ml-2 text-2xl font-bold text-gray-900">
            {language === 'en' ? 'Bihua' : '笔画'}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            className="p-1.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            title={language === 'en' ? 'Switch to 中文' : 'Switch to English'}
          >
            <Languages className="h-4 w-4" />
          </button>

          <button
            onClick={logout}
            className="p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md"
            title={language === 'en' ? 'Sign out' : '退出登录'}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <nav className="space-y-1">
          {navigation[language].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <MatrixChat />
        </div>
      </div>
    </div>
  );
}