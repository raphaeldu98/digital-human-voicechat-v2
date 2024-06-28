import React, { useEffect, useRef, useState } from 'react';

const VoiceInput = ({ onInput, isSpeaking }) => {
  const recognition = useRef(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'zh-CN'; // 设置语言为中文

      recognition.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          onInput(finalTranscript);
        }
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error', event);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          alert('麦克风访问被拒绝或服务不可用');
        }
      };

      // recognition.current.onend = () => {
      //   if (isListening && !isSpeaking) {
      //     recognition.current.start(); // 重新启动语音识别
      //   }
      // };
    } else {
      alert('您的浏览器不支持语音识别功能。');
    }
  }, [isListening, isSpeaking, onInput]);

  useEffect(() => {
    if (isSpeaking) {
      recognition.current.stop(); // 暂停语音识别
    } else if (isListening) {
      recognition.current.start(); // 恢复语音识别
    }
  }, [isSpeaking]);

  const startListening = () => {
    if (recognition.current) {
      recognition.current.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    startListening();
    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  return null;
};

export default VoiceInput;