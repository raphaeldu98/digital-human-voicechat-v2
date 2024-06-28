app.post('/api/chat', async (req, res) => {
    const userInput = req.body.input;
    try {
      const botResponse = await makeHuggingFaceRequest(userInput);
      const generatedText = botResponse && botResponse[0] && botResponse[0].generated_text ? botResponse[0].generated_text : "No response";
      if (userInput.toLowerCase().includes("open")) {
        const fileName = userInput.toLowerCase().split("open ")[1].trim(); // 假设文件名紧跟在 "open" 之后
        openFile(fileName);
      }
      const audioFilePath = await synthesizeSpeech(generatedText);
      res.json({ response: generatedText, audioFilePath });
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