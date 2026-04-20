import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

async function testModels() {
    const models = [
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-1.5-pro',
        'gemini-1.5-pro-latest',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest'
    ];

    for (const model of models) {
        try {
            console.log(`Testing ${model}...`);
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: 'Say success' }]
                        }]
                    })
                }
            );

            const data = await response.json();
            if (data.candidates) {
                console.log(`✅ ${model} SUCCESS:`, data.candidates[0]?.content?.parts[0]?.text);
            } else if (data.error) {
                console.log(`❌ ${model} ERROR:`, data.error.message);
            }
        } catch (e: any) {
            console.log(`❌ ${model} FAILED:`, e.message);
        }
    }
}

testModels();
