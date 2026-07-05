import { Actor } from 'apify';
import { OpenRouter } from '@openrouter/sdk';

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

// 3. Point the official OpenRouter SDK to the Apify tunnel endpoint
const client = new OpenRouter({
    serverURL: 'https://openrouter.apify.actor/api/v1',
    apiKey: apifyToken, 
});

async function main() {
    try {
        console.log('Sending request to OpenRouter through your Apify Account...');

        // 4. Dispatch the chat completion payload using the structure required by the OpenRouter SDK
        const result = await client.chat.send({
            chatRequest: {
                model: 'meta-llama/llama-3-70b-instruct', 
                messages: [
                    { role: 'user', content: 'Hello! What model are you?' }
                ],
            },
        });

        // 5. Extract the string result safely using OpenRouter's object mapping layout
        const aiReply = result.choices[0]?.message?.content;
        
        console.log('\n--- AI Response ---');
        console.log(aiReply);
        console.log('-------------------\n');
        
        // 6. Push runtime tracking results directly to your dataset
        await Actor.pushData({
            status: 'SUCCESS',
            model: 'meta-llama/llama-3-70b-instruct',
            response: aiReply,
        });

    } catch (error) {
        console.error('Execution Error:', error.message || error);
        await Actor.fail(error);
    } finally {
        // 7. Cleanly shut down the container lifecycle engine
        await Actor.exit();
    }
}

// Execute the process
await main();
