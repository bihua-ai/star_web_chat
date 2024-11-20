import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { ListType, Resident, Group, LLMModel } from '../types/list';
import ItemList from './ItemList';
import { useLanguage } from '../contexts/LanguageContext';
import ResidentDetailView from './ResidentDetailView';
import GroupDetailView from './GroupDetailView';
import Pagination from './Pagination';
import { UserPlus, Play, Square, X } from 'lucide-react';

interface RegisterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (username: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

function RegisterDialog({ isOpen, onClose, onRegister, isLoading, error }: RegisterDialogProps) {
  const { language } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRegister(username, password);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {language === 'en' ? 'Register New Resident' : '注册新居民'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              {language === 'en' ? 'Username' : '用户名'}
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {language === 'en' ? 'Password' : '密码'}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
            >
              {language === 'en' ? 'Cancel' : '取消'}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'Register' : '注册'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Rest of the imports and mock data remain the same...

export default function ListContainer() {
  const { type, id } = useParams<{ type: ListType; id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<(Resident | Group | LLMModel)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Pagination state
  const itemsPerPage = 10;
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Rest of the existing useEffect and handlers...

  const handleRegisterResident = async (username: string, password: string) => {
    setRegisterError(null);
    setActionLoading('register');
    try {
      const response = await fetch('/api/register', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register resident');
      }

      setIsRegisterDialogOpen(false);
      // Refresh the list
      window.location.reload();
    } catch (err) {
      setRegisterError(language === 'en' 
        ? 'Failed to register resident' 
        : '注册居民失败');
    } finally {
      setActionLoading(null);
    }
  };

  // Rest of the existing handlers...

  if (!type) {
    return (
      <div className="text-center text-gray-500 mt-8">
        {language === 'en' 
          ? 'Invalid page' 
          : '无效页面'}
      </div>
    );
  }

  return (
    <div className="flex h-full gap-6">
      <div className="w-80 bg-white rounded-lg shadow-sm">
        {type === 'residents' && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsRegisterDialogOpen(true)}
                disabled={actionLoading === 'register'}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {actionLoading === 'register' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Register Resident' : '注册居民'}
                  </>
                )}
              </button>
              <button
                onClick={handleRunAgents}
                disabled={actionLoading === 'run'}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {actionLoading === 'run' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Run Agents' : '启动代理'}
                  </>
                )}
              </button>
              <button
                onClick={handleStopAgents}
                disabled={actionLoading === 'stop'}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                {actionLoading === 'stop' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Stop Agents' : '停止代理'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          ) : (
            <>
              <ItemList
                items={paginatedItems}
                type={type}
                onItemClick={handleItemClick}
              />
              {items.length > itemsPerPage && (
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
        {id ? (
          type === 'residents' ? (
            <ResidentDetailView resident={items.find(r => 'resident_id' in r && r.resident_id === id) as Resident} />
          ) : type === 'groups' ? (
            <GroupDetailView group={items.find(g => 'group_id' in g && g.group_id === id) as Group} />
          ) : (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {(items.find(m => 'model_id' in m && m.model_id === id) as LLMModel)?.model_id}
              </h3>
              <p className="text-gray-600">
                {language === 'en' 
                  ? 'Detailed information will be displayed here.'
                  : '详细信息将显示在这里。'}
              </p>
            </div>
          )
        ) : (
          <div className="text-center text-gray-500 mt-8">
            {language === 'en' 
              ? 'Select an item to view details'
              : '选择一个项目查看详情'}
          </div>
        )}
      </div>

      <RegisterDialog
        isOpen={isRegisterDialogOpen}
        onClose={() => {
          setIsRegisterDialogOpen(false);
          setRegisterError(null);
        }}
        onRegister={handleRegisterResident}
        isLoading={actionLoading === 'register'}
        error={registerError}
      />
    </div>
  );
}