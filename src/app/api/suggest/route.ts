import { NextResponse } from 'next/server';

import AWS from 'aws-sdk';
import { PRIMARY_MODEL, getFallbackModel } from '@/utils/model-selection';

const client = new AWS.SageMakerRuntime({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

async function generateSuggestionWithFallback(messages: any[]) {
  try {
    const params = {
      Body: JSON.stringify({
        messages,
        model: PRIMARY_MODEL,
        temperature: 0.7,
        max_tokens: 200,
        top_p: 1,
      }),
      EndpointName: PRIMARY_MODEL,
      ContentType: "application/json",
    };
    return await client.invokeEndpoint(params).promise();
  } catch (error) {
    // If the primary model fails, try with a fallback model
    console.error('Primary model failed, trying fallback model');
    const params = {
      Body: JSON.stringify({
        messages,
        model: getFallbackModel(),
        temperature: 0.7,
        max_tokens: 200,
        top_p: 1,
      }),
      EndpointName: getFallbackModel(),
      ContentType: "application/json",
    };
    return await client.invokeEndpoint(params).promise();
  }
}

export async function POST(request: Request) {
  try {
    const { html } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    const completion = await generateSuggestionWithFallback([
      {
        role: 'user',
        content: `Given this HTML content, suggest a concise title and brief description that captures the essence of the app. The title should be descriptive, while the description should explain what the app does in a single sentence. Format the response as JSON with "title" and "description" fields.

<app html>
${html}
</app html>`,
      },
    ]);

    const responseContent = completion.Body.toString();
    const startIndex = responseContent.indexOf('{');
    const endIndex = responseContent.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error('Invalid JSON response from AI');
    }

    const jsonContent = responseContent.substring(startIndex, endIndex + 1);
    const suggestions = JSON.parse(jsonContent);

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
