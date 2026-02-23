import React, { useEffect, useRef, useState } from 'react';

const ChatRoom = ({
  roomId = 'default',
  userName = 'You',
  disabled = false,
  onEndTrip,
  // Modal props
  isModal = false,
  isOpen = true,
  onClose,
  width = 420,
  height = 640,
}) => {
  if (isModal && !isOpen) return null;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const wsRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    // Basic WebSocket client (replace URL with your server)
    try {
      const ws = new WebSocket(`ws://localhost:4000/?room=${roomId}`);
      wsRef.current = ws;

      ws.addEventListener('open', () => console.debug('ChatRoom: ws open'));
      ws.addEventListener('message', (ev) => {
        try {
          const data = JSON.parse(ev.data);
          setMessages((m) => [...m, data]);
        } catch (e) {
          setMessages((m) => [...m, { type: 'message', user: 'server', text: String(ev.data) }]);
        }
      });
      ws.addEventListener('close', () => console.debug('ChatRoom: ws closed'));

      return () => {
        ws.close();
      };
    } catch (err) {
      console.error('ChatRoom ws error', err);
    }
  }, [roomId]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || disabled) return;
    const payload = { type: 'message', user: userName, text: input.trim(), ts: Date.now() };
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
      }
      setMessages((m) => [...m, payload]);
      setInput('');
    } catch (err) {
      console.error('send message error', err);
    }
  };

  const ChatContent = (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-auto p-3" ref={listRef} style={{ minHeight: 0 }}>
        {messages.length === 0 ? (
          <div className="text-sm text-gray-400">No messages yet. Say hi 👋</div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`mb-3 ${m.user === userName ? 'text-right' : 'text-left'}`}>
              <div className="inline-block px-3 py-2 rounded-lg shadow-sm" style={{ background: m.user === userName ? '#fdf2f8' : '#f3f4f6' }}>
                <div className="text-xs text-gray-500 font-semibold">{m.user}</div>
                <div className="text-sm">{m.text}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t bg-white">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={disabled ? 'Chat ended' : 'Type a message...'}
            disabled={disabled}
            className="flex-1 px-3 py-2 rounded-xl border focus:outline-none"
          />
          <button onClick={sendMessage} disabled={disabled} className="px-4 py-2 bg-pink-600 text-white rounded-xl disabled:opacity-60">
            Send
          </button>
        </div>

        {!isModal && (
          <div className="mt-3 flex justify-end">
            <button onClick={onEndTrip} className="px-4 py-2 text-sm bg-rose-600 text-white rounded-xl">End Trip</button>
          </div>
        )}
      </div>
      </div>
    );

    if (!isModal) return ChatContent;

    // Modal wrapper
    const handleEndTrip = () => {
      if (onEndTrip) onEndTrip();
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div
          className="relative bg-white rounded-2xl p-0 shadow-2xl border border-pink-100 overflow-hidden flex flex-col"
          style={{ width: 'min(100%, ' + width + 'px)', height: 'min(100%, ' + height + 'px)' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="text-gray-500 hover:text-gray-800 px-2 py-1 rounded-md">Back</button>
              <div className="text-sm font-bold">Chat</div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => { handleEndTrip(); if (onClose) onClose(); }} className="px-3 py-1 rounded-md bg-rose-600 text-white text-sm">End Trip</button>
            </div>
          </div>

          <div className="flex-1 min-h-0">{ChatContent}</div>
        </div>
      </div>
    );
  };

export default ChatRoom;
