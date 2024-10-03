import React, { useEffect, useState } from 'react';
import { user } from "../Join/Join";
import socketIo from "socket.io-client";
import "./Chat.css";
import sendLogo from "../../images/send.png";
import Message from "../Message/Message";
import ReactScrollToBottom from "react-scroll-to-bottom";
import closeIcon from "../../images/closeIcon.png";

let socket;
const ENDPOINT = "http://localhost:4500";  // Update to your server URL

const Chat = () => {
    const [id, setId] = useState("");
    const [messages, setMessages] = useState([]);

    // Function to send a message to the server
    const send = () => {
        const message = document.getElementById('chatInput').value;
        if (message.trim()) {
            socket.emit('message', { message, id });
            document.getElementById('chatInput').value = "";
            playNotificationSound();  // Play sound when a message is sent
        }
    };

    // Function to play notification sound
    const playNotificationSound = () => {
        const audio = new Audio('/yuppie.mp3');  // Path to your sound file in the public folder
        audio.play().catch((error) => {
            console.error("Audio play failed:", error);
        });
    };

    useEffect(() => {
        // Create socket connection
        socket = socketIo(ENDPOINT, { transports: ['websocket'] });

        // Set user ID once connected
        socket.on('connect', () => {
            setId(socket.id);
        });

        // Emit 'joined' event when the user joins
        socket.emit('joined', { user });

        // Event listener for welcome message
        socket.on('welcome', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
            playNotificationSound();  // Play sound when welcome message is received
        });

        // Event listener for user joined
        socket.on('userJoined', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
            playNotificationSound();  // Play sound when a user joins
        });

        // Event listener for new messages
        socket.on('sendMessage', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
            playNotificationSound();  // Play sound when a new message is received
        });

        // Event listener for when a user leaves
        socket.on('leave', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);  // Update message list when a user leaves
            playNotificationSound();  // Play sound when a user leaves
        });

        // Cleanup on component unmount
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
}

export default Chat;
