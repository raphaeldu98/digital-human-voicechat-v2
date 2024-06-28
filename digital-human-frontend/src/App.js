import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ErrorBoundary from './ErrorBoundary';
import VoiceInput from './VoiceInput';
import './App.css';

const DigitalHuman = React.lazy(() => import('./DigitalHuman'));

function App() {
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleUserInput = async (inputText) => {
    if (!inputText) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: inputText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${errorData.message} - ${JSON.stringify(errorData.error)}`);
      }

      const data = await response.json();
      const botResponse = data.response;
      const audioFilePath = data.audioFilePath;
      setConversation((prev) => [...prev, { user: inputText, bot: botResponse }]);
      playAudio(audioFilePath);  // 调用语音输出
      //speak(botResponse);
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (audioFilePath) => {
    const audio = new Audio(audioFilePath);
    audio.onplay = () => setIsSpeaking(true);
    audio.onended = () => setIsSpeaking(false);
    audio.play();
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN'; // 设置语言为中文
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("您的浏览器不支持语音合成功能。");
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleInputSubmit = () => {
    handleUserInput(input);
    setInput("");
  };

  return (
    <div className="App">
      <div className="digital-human">
        <ErrorBoundary>
          <Suspense fallback={<p>Loading model...</p>}>
            <Canvas>
              <ambientLight intensity={1} />
              <directionalLight position={[0, 5, 5]} />
              <DigitalHuman />
              <OrbitControls />
            </Canvas>
          </Suspense>
        </ErrorBoundary>
      </div>
      <div className="conversation">
        {conversation.map((msg, index) => (
          <div key={index}>
            <p>User: {msg.user}</p>
            <p>Bot: {msg.bot}</p>
          </div>
        ))}
        {loading && <p>Loading...</p>}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleInputSubmit();
            }
          }}
        />
        <button onClick={handleInputSubmit}>Send</button>
        <VoiceInput onInput={handleUserInput} isSpeaking={isSpeaking} />
      </div>
    </div>
  );
}

export default App;