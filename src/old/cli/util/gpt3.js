/* eslint no-undef: 0 */
/* eslint camelcase: 0 */
import dotenv from 'dotenv'
dotenv.config()

import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export default async function (summary, prompt) {
  if (!configuration.apiKey) {
    console.error({
      error: {
        message: 'OpenAI API key not configured, please follow instructions in README.md',
      },
    })
    return
  }

  const nullCheckedPrompt = prompt || ''
  if (nullCheckedPrompt.trim().length === 0) {
    console.error({
      error: {
        message: 'Please enter a valid prompt',
      },
    })
    return
  }

  try {
    const completion = await openai.createCompletion({
      model: 'code-davinci-002',
      prompt: generatePrompt('', 'this is a test'),
      temperature: 0.6,
      max_tokens: 1000,
    })
    return completion
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data)
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`)
      console.error({
        error: {
          message: 'An error occurred during your request.',
        },
      })
    }
  }
}

function generatePrompt(summary, prompt) {
  return `given a node.js codebase summarized thusly: ${summary}\ngenerate test cases for the following: ${prompt}`
}
