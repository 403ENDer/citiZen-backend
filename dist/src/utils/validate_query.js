"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyUserQuery = classifyUserQuery;
require("dotenv/config");
const groq_1 = require("@langchain/groq");
const output_parsers_1 = require("@langchain/core/output_parsers");
const prompts_1 = require("@langchain/core/prompts");
// ✅ Initialize Groq model
const model = new groq_1.ChatGroq({
    model: "llama-3.1-8b-instant",
    temperature: 0,
    apiKey: process.env.GROQ_API_KEY,
});
// ✅ Parser enforces JSON structure
const parser = new output_parsers_1.JsonOutputParser();
// ✅ Prompt template
const prompt = prompts_1.ChatPromptTemplate.fromTemplate(`You are a government query classifier.

Your task:
- Classify the given user query into one or more of the following departments:
  - Electricity Department
  - Water Supply Department
  - Sanitation Department
  - Transport Department
  - Revenue Department
  - Health Department
  - Police Department
  - Education Department

Instructions:
- Always return the result in strict JSON format.
- Use the key "department".
- If the query relates to more than one department, return the value as an array of department names.
- Department names must match exactly as listed above.
- Do not include any explanation, only return JSON.

Example:
User query: "In our area government school has electricity issues and poor water quality."
Output:
{{
  "department": ["Electricity Department", "Water Supply Department", "Education Department"]
}}

Now classify the following query:
{format_instructions}
Query: {query}`);
// ✅ Export the classification function
async function classifyUserQuery(query) {
    try {
        // Check if GROQ API key is available
        if (!process.env.GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY not found in environment variables");
        }
        // ✅ Insert format instructions into prompt
        const partialedPrompt = await prompt.partial({
            format_instructions: parser.getFormatInstructions(),
        });
        // ✅ Build chain (prompt → model → parser)
        const chain = partialedPrompt.pipe(model).pipe(parser);
        const result = await chain.invoke({ query });
        console.log("Raw AI classification result:", result);
        console.log("Result type:", typeof result);
        console.log("Result.department:", result.department);
        // Convert the actual response format to the expected format
        return {
            userquery: query,
            classification: result.department
        };
    }
    catch (err) {
        console.error("Classification error:", err);
        throw err;
    }
}
