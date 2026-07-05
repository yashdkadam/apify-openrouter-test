import { Actor } from 'apify';
import { OpenAI } from 'openai';

// 1. Initialize the Apify runtime environment container
await Actor.init();

// 2. Fetch the platform-injected authentication token securely from the environment
const apifyToken = process.env.APIFY_TOKEN;

if (!apifyToken) {
    const errorMsg = 'APIFY_TOKEN is missing. This Actor must run within the Apify platform infrastructure.';
    console.error(errorMsg);
    await Actor.fail(new Error(errorMsg));
    await Actor.exit();
}

// 3. Initialize OpenAI client pointing directly to Apify's custom tunnel base URL
const client = new OpenAI({
    baseURL: 'https://apify.actor', // Verified production base routing path
    apiKey: apifyToken, 
});

async function main() {
    try {
        console.log('Sending request to OpenRouter through your Apify Account...');

        // 4. Dispatch the chat completion payload matching your prompt and model specifications
        const completion = await client.chat.completions.create({
            model: 'meta-llama/llama-3-70b-instruct', 
            messages: [
                { role: 'user', content: 'Hello! What model are you?' }
            ],
        });

        // 5. Output the response directly to the live Apify execution logs
        const aiReply = completion.choices[0]?.message?.content;
        console.log('\n--- AI Response ---');
        console.log(aiReply);
        console.log('-------------------\n');
        
        // 6. Push runtime tracking results and token metadata straight to your dataset
        await Actor.pushData({
            status: 'SUCCESS',
            model: 'meta-llama/llama-3-70b-instruct',
            response: aiReply,
            usage: completion.usage,
        });

    } catch (error) {
        console.error('Execution Error:', error.message);
        await Actor.fail(error);
    } finally {
        // 7. Cleanly shut down the container lifecycle engine
        await Actor.exit();
    }
}

// Execute the wrapper process
await main();
