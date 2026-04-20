import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
    try {
        console.log('Testing Google Gemini connection...');
        const result = await generateText({
            model: google('gemini-2.5-flash'),
            prompt: 'return exactly the word success'
        });
        console.log('Google Success:', result.text);
    } catch (e: any) {
        console.error('Google failed:', e.message);
    }

    try {
        console.log('\nTesting DeepSeek via OpenAI-compatible endpoint...');
        const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: 'say success' }],
                max_tokens: 10
            })
        });
        const json = await res.json();
        if (json.error) throw new Error(json.error.message);
        console.log('DeepSeek Success:', json.choices?.[0]?.message?.content);
    } catch (e: any) {
        console.error('DeepSeek failed:', e.message);
    }
}
check();
