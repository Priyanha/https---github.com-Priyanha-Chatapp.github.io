import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChatWindow = () => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const { userId } = useParams();

    const fetchMessages = async () => {
        try {
            const response = await axios.get('/api/chat');
            setMessages(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/chat', { message });
            setMessage('');
            fetchMessages();
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    return (
        <div>
            <h2>Chat</h2>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>{msg.content}</div>
                ))}
            </div>
            <form onSubmit={handleSubmit}>
                <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} required />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default ChatWindow;
