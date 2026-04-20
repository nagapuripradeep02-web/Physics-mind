import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
    try {
        console.log('Testing gemini-2.0-flash...');
        const result20 = await generateText({
            model: google('gemini-2.0-flash'),
            prompt: 'return exactly the word success'
        });
        console.log('2.0 Flash Success:', result20.text);
    } catch (e: any) {
        console.error('2.0 Flash failed:', e.message);
    }

    try {
        console.log('\nTesting gemini-1.5-flash...');
        const result15 = await generateText({
            model: google('gemini-1.5-flash'),
            prompt: 'return exactly the word success'
        });
        console.log('1.5 Flash Success:', result15.text);
    } catch (e: any) {
        console.error('1.5 Flash failed:', e.message);
    }
}
check();
