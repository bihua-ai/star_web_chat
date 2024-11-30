import React, { useState, useEffect, useRef } from 'react';
import { createClient } from 'matrix-js-sdk';
import { Send, Upload, Mic } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { MATRIX_CONFIG } from '../config/api';
import VoiceRecorder from './VoiceRecorder';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: number;
}

export default function MatrixChat() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processedMessagesRef = useRef(new Set<string>());
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const initMatrix = async () => {
      try {
        const client = createClient({
          baseUrl: MATRIX_CONFIG.homeserverUrl,
          userId: MATRIX_CONFIG.userId,
        });

        await client.login('m.login.password', {
          user: MATRIX_CONFIG.userId,
          password: MATRIX_CONFIG.password,
        });

        client.on('Room.timeline', (event: any) => {
          if (event.getType() === 'm.room.message' && !processedMessagesRef.current.has(event.getId())) {
            processedMessagesRef.current.add(event.getId());
            const content = event.getContent();
            setMessages(prev => [...prev, {
              id: event.getId(),
              content: content.body,
              sender: event.getSender(),
              timestamp: event.getTs(),
            }]);
          }
        });

        await client.startClient();
        clientRef.current = client;
        setIsConnected(true);
        setError(null);

      } catch (err: any) {
        console.error('Matrix init error:', err);
        setError(language === 'en' 
          ? 'Failed to connect to chat server' 
          : '无法连接到聊天服务器');
        setIsConnected(false);

        // Retry after delay if rate limited
        if (err.httpStatus === 429) {
          const retryAfter = err.data?.retry_after_ms || 5000;
          retryTimeoutRef.current = setTimeout(initMatrix, retryAfter);
        }
      }
    };

    initMatrix();

    return () => {
      if (clientRef.current) {
        clientRef.current.stopClient();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [language]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !clientRef.current || !isConnected) return;

    try {
      await clientRef.current.sendTextMessage(
        MATRIX_CONFIG.defaultRoomId,
        newMessage.trim()
      );
      setNewMessage('');
      setError(null);
    } catch (err) {
      console.error('Error sending event:', err);
      setError(language === 'en' 
        ? 'Failed to send message' 
        : '发送消息失败');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clientRef.current || !isConnected) return;

    try {
      const content = {
        body: file.name,
        filename: file.name,
        info: {
          size: file.size,
          mimetype: file.type,
        },
        msgtype: 'm.file',
      };

      await clientRef.current.uploadContent(file);
      await clientRef.current.sendMessage(MATRIX_CONFIG.defaultRoomId, content);
      setError(null);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(language === 'en' 
        ? 'Failed to upload file' 
        : '上传文件失败');
    }
  };

  const handleVoiceRecording = async (blob: Blob) => {
    if (!clientRef.current || !isConnected) return;

    try {
      const content = {
        body: 'Voice message',
        info: {
          size: blob.size,
          mimetype: blob.type,
        },
        msgtype: 'm.audio',
      };

      await clientRef.current.uploadContent(blob);
      await clientRef.current.sendMessage(MATRIX_CONFIG.defaultRoomId, content);
      setError(null);
    } catch (err) {
      console.error('Error sending voice message:', err);
      setError(language === 'en' 
        ? 'Failed to send voice message' 
        : '发送语音消息失败');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] max-h-[66vh]">
      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
        {error && (
          <div className="p-2 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            {language === 'en' 
              ? 'No messages yet' 
              : '暂无消息'}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={`${message.id}-${message.timestamp}`}
            className={`p-2 rounded-lg max-w-[80%] ${
              message.sender === clientRef.current?.getUserId()
                ? 'ml-auto bg-indigo-100'
                : 'bg-gray-100'
            }`}
          >
            <div className="text-sm">{message.content}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 p-4 border-t">
        <div className="flex items-center gap-1 mb-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-gray-600 hover:text-gray-900 rounded-md"
            disabled={!isConnected}
            title={language === 'en' ? 'Upload file' : '上传文件'}
          >
            <Upload className="h-4 w-4" />
          </button>
          
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecording}
            disabled={!isConnected}
            compact={true}
          />
        </div>

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={language === 'en' ? 'Type a message...' : '输入消息...'}
            className="w-full px-3 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y min-h-[2.5rem] max-h-[8rem]"
            disabled={!isConnected}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!isConnected || !newMessage.trim()}
            className={`absolute right-2 bottom-2 p-1.5 rounded-md ${
              isConnected && newMessage.trim()
                ? 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}