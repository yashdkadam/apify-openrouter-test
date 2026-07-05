import { Actor } from 'apify';
import { OpenAI } from 'openai';

// 1. Initialize the Apify runtime environment
await Actor.init();

// 2. Fetch the production token injected by the platform runner context
const apifyToken = process.env.APIFY_TOKEN;

if (!apifyToken) {
    const errorMsg = 'APIFY_TOKEN is missing. This Actor must run within the Apify platform infrastructure.';
    console.error(errorMsg);
    await Actor.fail(new Error(errorMsg));
    await Actor.exit();
}

// 3. Initialize the OpenAI client pointing to the stable internal Apify tool gateway URL
const client = new OpenAI({
    baseURL: 'https://apify.com',
    apiKey: apifyToken, 
});

try {
    console.log('Sending request to OpenRouter through your Apify Account...');

    // 4. Dispatch the chat completion payload matching your exact prompt and model
    const completion = await client.chat.completions.create({
        model: 'meta-llama/llama-3-70b-instruct', 
        messages: [
            { role: 'user', content: 'Hello! What model are you?' }
        ],
    });

    // 5. Output the response directly to the Apify execution logs
    const aiReply = completion.choices[0]?.message?.content;
    console.log('\n--- AI Response ---');
    console.log(aiReply);
    console.log('-------------------\n');
    
    // 6. Push the results to your default run dataset
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
    // 7. Cleanly exit the Actor container process
    await Actor.exit();
}
