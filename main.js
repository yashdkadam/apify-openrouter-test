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

// 3. Initialize OpenAI client to hit Apify's cross-provider OpenRouter tunnel
const openai = new OpenAI({
    apiKey: apifyToken,
    baseURL: 'https://apify.actor',
});

try {
    console.log('Initiating test prompt through the production Apify-OpenRouter bridge...');

    // 4. Dispatch chat completion payload
    const response = await openai.chat.completions.create({
        model: 'meta-llama/llama-3-8b-instruct',
        messages: [
            { role: 'user', content: 'Confirm connection and summarize your context window capacity.' }
        ],
    });

    const aiReply = response.choices[0]?.message?.content;

    console.log('\n================ AI RESPONSE ================\n');
    console.log(aiReply);
    console.log('\n=============================================\n');

    // 5. Store tracking data directly into the default run dataset
    await Actor.pushData({
        status: 'SUCCESS',
        modelUsed: 'meta-llama/llama-3-8b-instruct',
        aiOutput: aiReply,
        billingMetadata: {
            promptTokens: response.usage?.prompt_tokens,
            completionTokens: response.usage?.completion_tokens,
            totalTokens: response.usage?.total_tokens
        }
    });

} catch (error) {
    console.error('Production Integration Test Failure:', error.message);
    await Actor.fail(error);
} finally {
    // 6. Gracefully tear down the actor process container
    await Actor.exit();
}
