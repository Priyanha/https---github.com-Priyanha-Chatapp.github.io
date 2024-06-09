import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../components/axiosConfig';
import io from 'socket.io-client';
import './Chat.css'; // Import CSS file

const socket = io('http://localhost:5000'); // Ensure this matches your backend URL

const Chat = () => {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const receivedMessageIds = useRef(new Set());

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get(`/chat/${userId}`);
        setMessages(res.data);
        // Store the received message IDs to avoid duplicates
        res.data.forEach(msg => receivedMessageIds.current.add(msg._id));
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();

    socket.on('receiveMessage', (message) => {
      // Check if the message ID already exists to avoid duplication
      if (!receivedMessageIds.current.has(message._id)) {
        setMessages((prevMessages) => [...prevMessages, message]);
        receivedMessageIds.current.add(message._id);
      }
    });

    socket.on('typing', (data) => {
      if (data.userId === userId) {
        setIsTyping(true);
      }
    });

    socket.on('stopTyping', (data) => {
      if (data.userId === userId) {
        setIsTyping(false);
      }
    });

    socket.on('messageRead', (data) => {
      if (data.userId === userId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === data.messageId ? { ...msg, read: true } : msg
          )
        );
      }
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('typing');
      socket.off('stopTyping');
      socket.off('messageRead');
    };
  }, [userId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    try {
      const res = await axiosInstance.post(`/chat/${userId}`, { message: newMessage });
      socket.emit('sendMessage', res.data); // Emit the message to the server
      setMessages([...messages, res.data]);
      receivedMessageIds.current.add(res.data._id); // Add the new message ID to the set
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    } else {
      socket.emit('typing', { userId: localStorage.getItem('userId') });
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { userId: localStorage.getItem('userId') });
      typingTimeoutRef.current = null;
    }, 2000);
  };

  const handleReadMessage = (messageId) => {
    socket.emit('messageRead', { userId: localStorage.getItem('userId'), messageId });
  };

  useEffect(() => {
    messages.forEach((msg) => {
      if (!msg.read && msg.sender !== localStorage.getItem('userId')) {
        handleReadMessage(msg._id);
      }
    });
  }, [messages]);

  return (
    <div className="chat-container">
      <h2>Chat with {userId}</h2>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender === localStorage.getItem('userId') ? 'sent' : 'received'}`}>
            <strong>{msg.sender === localStorage.getItem('userId') ? 'You' : 'Them'}:</strong> {msg.text}
            {msg.read && <span className="read-receipt">Read</span>}
          </div>
        ))}
        {isTyping && <div className="typing-indicator">The other user is typing...</div>}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleTyping}
          placeholder="Type your message here"
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
