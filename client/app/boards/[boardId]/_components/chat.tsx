"use client";

import axios from "axios";
import { FC, useEffect, useState } from "react";
import { io } from "socket.io-client";

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  username: string;
}

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const Chat: FC<ChatProps> = ({ isOpen, onClose, boardId, username }) => {
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");

  useEffect(() => {
    // Connect to socket server
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    // Join the board room
    newSocket.emit("joinBoard", { boardId, username });

    // Listen for incoming messages
    newSocket.on("receiveMessage", (message: any) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Fetch initial messages from the database
    fetchMessages();

    // Clean up on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, [boardId, username]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/boards/${boardId}/messages`);
      setMessages(response.data); // Set the fetched messages
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && socket) {
      socket.emit("sendMessage", { boardId, username, message: inputMessage });
      setInputMessage("");
    }
  };

  return (
    <div
      className={`fixed top-2 bottom-2 h-[calc(100vh-16px)] w-[400px] bg-white shadow-lg transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0 right-4" : "translate-x-full right-0"
      } rounded-lg`}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Chat</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">
          &times;
        </button>
      </div>
      <div className="p-4 overflow-y-auto max-h-[80vh] flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-grow flex items-center justify-center">
            <span className="text-gray-500">No Messages</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((msg, index) => (
              <div key={index} className="p-2 bg-gray-100 rounded-md">
                <strong>{msg.username}: </strong> {msg.message}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-4 border-t flex gap-[2%] justify-center items-center">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="border rounded-md p-2 w-[78%]"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSendMessage}
          className="w-[20%] bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
