import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchChannels, fetchMessages, sendMessage, setActiveChannel, appendMessage } from '../store/slices/chatSlice';
import { initSocketClient } from '../services/socket';
import { Hash, Send, Plus, Users, Smile } from 'lucide-react';

const ChatStreamsPage = () => {
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const { user } = useSelector((state) => state.auth);
  const { channels, activeChannel, messages } = useSelector((state) => state.chat);

  const [inputMessage, setInputMessage] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentWorkspace) {
      dispatch(fetchChannels(currentWorkspace._id));
    }
  }, [currentWorkspace, dispatch]);

  useEffect(() => {
    if (activeChannel) {
      dispatch(fetchMessages(activeChannel._id));

      const socket = initSocketClient();
      socket.emit('join_room', activeChannel._id);

      const handleNewMessage = ({ channelId, message }) => {
        if (channelId === activeChannel._id) {
          dispatch(appendMessage({ channelId, message }));
        }
      };

      const handleUserTyping = ({ userName, isTyping }) => {
        setTypingUser(isTyping ? userName : null);
      };

      socket.on('new_message', handleNewMessage);
      socket.on('user_typing', handleUserTyping);

      return () => {
        socket.emit('leave_room', activeChannel._id);
        socket.off('new_message', handleNewMessage);
        socket.off('user_typing', handleUserTyping);
      };
    }
  }, [activeChannel, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChannel) return;

    dispatch(sendMessage({ channelId: activeChannel._id, content: inputMessage })).then(() => {
      setInputMessage('');
    });
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* Channels Sidebar */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 shrink-0 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Stream Channels</h3>
          <div className="space-y-1">
            {channels.map((ch) => (
              <button
                key={ch._id}
                onClick={() => dispatch(setActiveChannel(ch))}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                  activeChannel?._id === ch._id
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Hash className="w-4 h-4 opacity-70" />
                <span>{ch.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Feed */}
      <div className="flex-1 flex flex-col justify-between bg-slate-50 dark:bg-slate-950">
        {/* Chat Header */}
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between bg-white dark:bg-slate-900/40">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
            <Hash className="w-4 h-4 text-brand-500" />
            <span>{activeChannel?.name || 'select-channel'}</span>
          </div>
          {typingUser && <span className="text-xs text-brand-400 animate-pulse font-medium">{typingUser} is typing...</span>}
        </div>

        {/* Messages Scroll Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={msg._id || idx} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {msg.sender?.name?.[0] || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{msg.sender?.name || 'User'}</span>
                  <span className="text-[10px] text-slate-400">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 inline-block shadow-sm">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-2 border border-slate-200 dark:border-slate-700">
            <input
              type="text"
              placeholder={`Message #${activeChannel?.name || 'channel'}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none placeholder-slate-400"
            />
            <button
              type="submit"
              className="p-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition shadow shadow-brand-600/30 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatStreamsPage;
