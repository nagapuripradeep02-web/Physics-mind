import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

async function testModelsV1() {
    const models = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-2.0-flash',
        'gemini-exp-1114'
    ];

    console.log('Testing with v1 API...\n');

    for (const model of models) {
        try {
            console.log(`Testing ${model}...`);
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`,
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

testModelsV1();
