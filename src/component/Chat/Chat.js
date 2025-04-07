import React, { useEffect, useState } from 'react';
import { user } from "../Join/Join";
import socketIo from "socket.io-client";
import "./Chat.css";
import sendLogo from "../../images/send.png";
import Message from "../Message/Message";
import ReactScrollToBottom from "react-scroll-to-bottom";
import closeIcon from "../../images/closeIcon.png";

let socket;
const ENDPOINT = process.env.REACT_APP_BACKEND_URL || "http://localhost:4500";  // Update with live server URL

const Chat = () => {
    const [id, setId] = useState("");
    const [messages, setMessages] = useState([]);

    const send = () => {
        const message = document.getElementById('chatInput').value;
        if (message.trim()) {
            socket.emit('message', { message, id });
            document.getElementById('chatInput').value = "";
            playNotificationSound();
        }
    };

    const playNotificationSound = () => {
        const audio = new Audio('/yuppie.mp3');
        audio.play().catch((error) => {
            console.error("Audio play failed:", error);
        });
    };

    useEffect(() => {
        socket = socketIo(ENDPOINT, { transports: ['websocket'] });

        socket.on('connect', () => {
            setId(socket.id);
        });

        socket.emit('joined', { user });

        socket.on('welcome', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
            playNotificationSound();
        });

        socket.on('userJoined', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
            playNotificationSound();
        });

        socket.on('sendMessage', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
            playNotificationSound();
        });

        socket.on('leave', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
            playNotificationSound();
        });

        return () => {
            socket.emit('disconnect');
            socket.off();
        };
    }, []);

    return (
        <div className="chatPage">
            <div className="chatContainer">
                <div className="header">
                    <h2>Yuppy...!!!</h2>
                    <a href="/"><img src={closeIcon} alt="Close" /></a>
                </div>

                <ReactScrollToBottom className="chatBox">
                    {messages.map((item, i) => (
                        <Message key={i} user={item.id === id ? '' : item.user} message={item.message} classs={item.id === id ? 'right' : 'left'} />
                    ))}
                </ReactScrollToBottom>

                <div className="inputBox">
                    <input
                        onKeyPress={(event) => event.key === 'Enter' ? send() : null}
                        type="text"
                        id="chatInput"
                        placeholder="Type a message..."
                    />
                    <button onClick={send} className="sendBtn"><img src={sendLogo} alt="Send" /></button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
