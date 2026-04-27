const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Uses AI to structure extracted text from documents into a tabular format.
 * @param {string} textContent - The raw text extracted from Excel or Word.
 * @param {string} sectionType - The type of section (e.g., 'Achievements', 'Placements').
 * @returns {Promise<Array>} - A structured array of objects.
 */
const structureDataWithAI = async (textContent, sectionType, expectedColumns = null) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not found. Returning raw data.');
    return [{ raw: textContent.substring(0, 500) }];
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const colHint = expectedColumns?.length
      ? `The output objects MUST use exactly these keys: ${JSON.stringify(expectedColumns)}.`
      : 'Identify the most appropriate column headers from the data.';

    const prompt = `You are an AI assistant for a college magazine generator. 
I have extracted text from a document intended for the "${sectionType}" section.
Convert this text into a clean, structured JSON array of objects.

${colHint}
Return ONLY a valid JSON array. No markdown, no explanations, no code blocks.

Extracted Text:
${textContent.substring(0, 4000)}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
  } catch (error) {
    console.error('❌ AI Processing Error:', error);
    throw new Error('Failed to process data with AI: ' + error.message);
  }
};

module.exports = { structureDataWithAI };
