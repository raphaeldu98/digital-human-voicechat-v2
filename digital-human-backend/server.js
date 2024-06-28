const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const qs = require('qs');

const app = express();
const PORT = 5001;
const RETRY_INTERVAL = 5000;
const MAX_RETRIES = 5;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

const openFile = (fileName) => {
  const filePath = path.join(__dirname, 'files', fileName); // 假设文件在 'files' 目录下
  exec(`open "${filePath}"`, (err) => {
    if (err) {
      console.error(`Error opening file: ${err}`);
    }
  });
};

const makeHuggingFaceRequest = async (userInput, retries = 0) => {
  try {
    const response = await axios.post('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      inputs: userInput
    }, {
      headers: {
        'Authorization': `Bearer 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`
      }
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error === 'Model microsoft/DialoGPT-medium is currently loading' && retries < MAX_RETRIES) {
      console.log(`Model is loading. Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
      return makeHuggingFaceRequest(userInput, retries + 1);
    } else {
      throw error;
    }
  }
};

const synthesizeSpeech = async (text) => {
  try {
    const response = await axios.post('http://127.0.0.1:9966/tts', qs.stringify({
      text: text,
      prompt: "[oral_2][laugh_0][break_6]",
      voice: "2222",
      temperature: 0.3,
      top_p: 0.7,
      top_k: 20,
      skip_refine: 0,
      custom_voice: 0
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data.code === 0) {
      return response.data.audio_files[0].url;
    } else {
      throw new Error(response.data.msg);
    }
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    throw error;
  }
};

app.post('/api/chat', async (req, res) => {
  const userInput = req.body.input;
  try {
    const botResponse = await makeHuggingFaceRequest(userInput);
    const generatedText = botResponse && botResponse[0] && botResponse[0].generated_text ? botResponse[0].generated_text : "No response";
    if (userInput.toLowerCase().includes("open")) {
      const fileName = userInput.toLowerCase().split("open ")[1].trim(); 
      openFile(fileName);
    }
    if (userInput.toLowerCase().includes("打开")) {
      const fileName = userInput.toLowerCase().split("打开 ")[1].trim(); 
      openFile(fileName);
    }
    const audioFilePath = await synthesizeSpeech(generatedText);
    
    res.json({ response: generatedText, audioFilePath });
    //res.json({ response: generatedText});
  } catch (error) {
    console.error('Error processing request:', error);

    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data,
        message: error.response.statusText
      });
    } else if (error.request) {
      res.status(500).json({
        error: "No response received from Hugging Face API",
        message: error.message
      });
    } else {
      res.status(500).json({
        error: "Error in setting up the request to Hugging Face API",
        message: error.message
      });
    }
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


// const express = require('express');
// const bodyParser = require('body-parser');
// const axios = require('axios');
// const cors = require('cors');

// const app = express();
// const PORT = 5001;
// const RETRY_INTERVAL = 5000; 
// const MAX_RETRIES = 5; 

// app.use(cors({
//   origin: 'http://localhost:3000',
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(bodyParser.json());

// const makeLocalModelRequest = async (userInput, retries = 0) => {
//   try {
//     const response = await axios.post('http://192.168.1.104:5000/chat', null, {
//       params: { text: userInput }
//     });

//     return response.data;
//   } catch (error) {
//     if (error.response && error.response.data && error.response.data.error === 'Model is currently loading' && retries < MAX_RETRIES) {
//       console.log(`Model is loading. Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
//       await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
//       return makeLocalModelRequest(userInput, retries + 1);
//     } else {
//       throw error;
//     }
//   }
// };

// app.post('/api/chat', async (req, res) => {
//   const userInput = req.body.input;
//   try {
//     const botResponse = await makeLocalModelRequest(userInput);
//     const generatedText = botResponse && botResponse.response && botResponse.response.output ? botResponse.response.output : "No response";
//     res.json({ response: generatedText });
//   } catch (error) {
//     console.error('Error processing request:', error);

//     if (error.response) {
//       res.status(error.response.status).json({
//         error: error.response.data,
//         message: error.response.statusText
//       });
//     } else if (error.request) {
//       res.status(500).json({
//         error: "No response received from the local model",
//         message: error.message
//       });
//     } else {
//       res.status(500).json({
//         error: "Error in setting up the request to the local model",
//         message: error.message
//       });
//     }
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });



// const express = require('express');
// const bodyParser = require('body-parser');
// const axios = require('axios');
// const cors = require('cors');

// const app = express();
// const PORT = 5001;
// const RETRY_INTERVAL = 5000; 
// const MAX_RETRIES = 5; 

// app.use(cors({
//   origin: 'http://localhost:3000',
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(bodyParser.json());

// const makeHuggingFaceRequest = async (userInput, retries = 0) => {
//   const axiosConfig = {
//     headers: {
//       'Authorization': `Bearer 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`
//     },
//     timeout: 30000, // 10 seconds timeout
//     // proxy: {
//     //   host: '172-233-64-146.Ip.Linodeusercontent.Com', // 请替换为代理服务器主机
//     //   port: 7897 // 替换为代理服务器端口
//     // }
//   };

//   try {
//     const response = await axios.post('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
//       inputs: userInput
//     }, axiosConfig);

//     return response.data;
//   } catch (error) {
//     if (error.response && error.response.data && error.response.data.error === 'Model microsoft/DialoGPT-medium is currently loading' && retries < MAX_RETRIES) {
//       console.log(`Model is loading. Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
//       await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
//       return makeHuggingFaceRequest(userInput, retries + 1);
//     } else {
//       throw error;
//     }
//   }
// };

// app.post('/api/chat', async (req, res) => {
//   const userInput = req.body.input;
//   try {
//     const botResponse = await makeHuggingFaceRequest(userInput);
//     const generatedText = botResponse && botResponse[0] && botResponse[0].generated_text ? botResponse[0].generated_text : "No response";
//     res.json({ response: generatedText });
//   } catch (error) {
//     console.error('Error processing request:', error);

//     if (error.response) {
//       res.status(error.response.status).json({
//         error: error.response.data,
//         message: error.response.statusText
//       });
//     } else if (error.request) {
//       res.status(500).json({
//         error: "No response received from Hugging Face API",
//         message: error.message
//       });
//     } else {
//       res.status(500).json({
//         error: "Error in setting up the request to Hugging Face API",
//         message: error.message
//       });
//     }
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

// //后端语言大模型语音合成使用下述代码可实现语音输出
// const express = require('express');
// const bodyParser = require('body-parser');
// const axios = require('axios');
// const cors = require('cors');
// const say = require('say');

// const app = express();
// const PORT = 5001;
// const RETRY_INTERVAL = 5000;
// const MAX_RETRIES = 5;

// app.use(cors({
//   origin: 'http://localhost:3000',
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(bodyParser.json());

// const makeLocalModelRequest = async (userInput, retries = 0) => {
//   try {
//     const response = await axios.post('http://192.168.1.104:5000/chat', null, {
//       params: { text: userInput }
//     });

//     return response.data;
//   } catch (error) {
//     if (error.response && error.response.data && error.response.data.error === 'Model is currently loading' && retries < MAX_RETRIES) {
//       console.log(`Model is loading. Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
//       await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
//       return makeLocalModelRequest(userInput, retries + 1);
//     } else {
//       throw error;
//     }
//   }
// };

// app.post('/api/chat', async (req, res) => {
//   const userInput = req.body.input;
//   try {
//     const botResponse = await makeLocalModelRequest(userInput);
//     const generatedText = botResponse && botResponse.response && botResponse.response.output ? botResponse.response.output : "No response";

//     console.log('Generated Text:', generatedText); // Debug: Check the generated text

//     // Convert the response to Chinese speech and ensure the response is accurate
//     say.speak(generatedText, 'Microsoft Huihui Desktop', 1.0, (err) => {
//       if (err) {
//         console.error('Error speaking:', err);
//         res.status(500).json({
//           error: "Error in speaking the response",
//           message: err.message
//         });
//       } else {
//         console.log('Speech completed successfully'); // Debug: Confirm speech completed
//         res.json({ response: generatedText });
//       }
//     });

//   } catch (error) {
//     console.error('Error processing request:', error);

//     if (error.response) {
//       res.status(error.response.status).json({
//         error: error.response.data,
//         message: error.response.statusText
//       });
//     } else if (error.request) {
//       res.status(500).json({
//         error: "No response received from the local model",
//         message: error.message
//       });
//     } else {
//       res.status(500).json({
//         error: "Error in setting up the request to the local model",
//         message: error.message
//       });
//     }
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });