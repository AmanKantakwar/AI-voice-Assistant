import React, { useState, useEffect } from "react";
import axios from "axios";
import "./VoiceAssistant.css"; // Import CSS file

const VoiceAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [listening, setListening] = useState(false);
  const [typing, setTyping] = useState(false);  // Typing indicator when user is speaking
  const [speechPaused, setSpeechPaused] = useState(false);
  const [speechUtterance, setSpeechUtterance] = useState(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = "en-US";

  const startListening = () => {
    setListening(true);
    setTyping(true); // Show typing symbol when user starts speaking
    recognition.start();
  };

  const stopListening = () => {
    setListening(false);
    recognition.stop();
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    addMessage(transcript, "user");
    fetchAIResponse(transcript);
    setTyping(false); // Hide typing symbol when user stops speaking
    setListening(false); // User has stopped speaking
  };

  recognition.onerror = () => {
    setListening(false);
    setTyping(false); // Hide typing symbol in case of error
    alert("Speech recognition error. Try again!");
  };

  const fetchAIResponse = async (text) => {
    try {
      let aiResponse = "";

      // Check if the user is asking who designed the assistant
      if (text.toLowerCase().includes("who designed you")) {
        aiResponse = "I was designed by Aman Kantakwar, a highly skilled developer and designer. His expertise in problem-solving, UI/UX design, and cutting-edge technologies makes him exceptional in creating innovative and user-friendly solutions.";
      } else {
        const res = await axios.post(
          "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=AIzaSyBcuKq_fNBzOzWGgMTU7DagI8X3uA1KgKM",
          {
            contents: [{ role: "user", parts: [{ text }] }]
          },
          { headers: { "Content-Type": "application/json" } }
        );

        aiResponse = res?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that.";
      }

      addMessage(aiResponse, "ai");
      speak(aiResponse);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      addMessage("⚠️ Your limits are done: Unable to generate a response.", "ai");
    }
  };

  const addMessage = (text, sender) => {
    setMessages((prev) => [...prev, { text, sender }]);
  };

  const synth = window.speechSynthesis;

  const speak = (text) => {
    if (synth.speaking) synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    utterance.onend = () => setSpeechPaused(false);

    synth.speak(utterance);
    setSpeechUtterance(utterance);
  };

  const togglePause = () => {
    if (synth.speaking) {
      if (!speechPaused) {
        synth.pause();
      } else {
        synth.resume();
      }
      setSpeechPaused(!speechPaused);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    synth.cancel(); // Stop the AI assistant from speaking
  };

  return (
    <div className="chat-container">
      <h2><span>🎙️</span> AI Voice Assistant</h2>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {typing && <div className="message user typing">👤 Typing...</div>} {/* Show typing symbol when user is speaking */}
      </div>
      <div className="buttons">
        <button onClick={startListening} disabled={listening} className={`mic-button ${listening ? "listening" : ""}`}>
          🎤 Start
        </button>
        <button onClick={togglePause} className="pause-button">
          {speechPaused ? "▶️ Resume" : "⏸️ Pause"}
        </button>
        <button onClick={clearMessages} className="clear-button">
          ❌ Clear
        </button>
      </div>
      <footer className="footer">
        <span>Designed</span>
        <span>and</span>
        <span>Developed</span>
        <span>by</span>
        <span>|</span>
        <span className="highlight">Aman Kantakwar</span>
      </footer>
    </div>
  );
};

export default VoiceAssistant;
