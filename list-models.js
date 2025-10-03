// This script lists the available Google Generative AI models for your API key.
require('dotenv').config({ path: '.env.local' });
const https = require('https');

async function listGoogleModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Error: GEMINI_API_KEY environment variable is not set.');
      console.error('Please ensure your API key is correctly set in the .env.local file.');
      return;
    }

    console.log("Fetching available models from Google AI...\n");

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models?key=${apiKey}`,
      method: 'GET',
    };

    const request = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log("✅ Models that support 'generateContent':");
          response.models.forEach(model => {
            if (model.supportedGenerationMethods.includes('generateContent')) {
              console.log(`   - ${model.displayName} (ID: ${model.name})`);
            }
          });
           console.log("\nPlease choose a model ID from the list above.");
        } else {
          console.error(`API request failed with status code: ${res.statusCode}`);
          console.error("Response:", data);
        }
      });
    });

    request.on('error', (e) => {
      console.error("Error fetching models:", e.message);
    });

    request.end();

  } catch (error) {
    console.error("An unexpected error occurred:", error.message);
  }
}

listGoogleModels();
