import { useEffect, useState } from "react";
import { socket } from "./lib/socket";
import "./App.css";

function App() {
  const [roomId, setRoomId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server:", socket.id);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    socket.on("user-joined", (data) => {
      setMessages((prev) => [...prev, data.message]);
    });

    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, `${data.socketId}: ${data.message}`]);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("user-joined");
      socket.off("receive-message");
      socket.disconnect();
    };
  }, []);

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      alert("Please enter a room ID");
      return;
    }

    socket.emit("join-room", roomId);
    setMessages((prev) => [...prev, `You joined room: ${roomId}`]);
  };

  const handleSendMessage = () => {
    if (!roomId.trim()) {
      alert("Join a room first");
      return;
    }

    if (!messageInput.trim()) {
      return;
    }

    socket.emit("send-message", {
      roomId,
      message: messageInput,
    });

    setMessageInput("");
  };

  return (
    <main className="app">
      <section className="card">
        <h1>LiveSync</h1>
        <p>Real-time video conferencing platform</p>

        <div className="status">
          Status:{" "}
          <span className={isConnected ? "online" : "offline"}>
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <div className="room-box">
          <input
            type="text"
            placeholder="Enter room ID"
            value={roomId}
            onChange={(event) => setRoomId(event.target.value)}
          />

          <button onClick={handleJoinRoom}>Join Room</button>
        </div>

        <div className="chat-box">
          <h2>Room Chat Test</h2>

          <div className="messages">
            {messages.map((message, index) => (
              <p key={index}>{message}</p>
            ))}
          </div>

          <div className="message-input">
            <input
              type="text"
              placeholder="Type message"
              value={messageInput}
              onChange={(event) => setMessageInput(event.target.value)}
            />

            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;