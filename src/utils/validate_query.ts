import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// ✅ Define output type - updated to match actual response
// The LLM returns: { departments: [["Department Name", "email", "sub-query"], ...] }
interface AIResponse {
  departments?: any; // Be permissive, we'll validate/parse at runtime
}

// ✅ Initialize Groq model
const model = new ChatGroq({
  model: "llama-3.1-8b-instant",
  temperature: 0,
  apiKey: process.env.GROQ_API_KEY,
});

// ✅ Parser enforces JSON structure (use permissive type to accommodate array shape)
const parser = new JsonOutputParser<AIResponse>();

// ✅ Prompt template
const prompt = ChatPromptTemplate.fromTemplate(
  `You are a government query classifier.
  
  Your task:
  - Classify the given user query into one or more of the following departments:
    - Electricity Department (email: electricity@gov.in)
    - Water Supply Department (email: water@gov.in)
    - Sanitation Department (email: sanitation@gov.in)
    - Transport Department (email: transport@gov.in)
    - Revenue Department (email: revenue@gov.in)
    - Health Department (email: health@gov.in)
    - Police Department (email: police@gov.in)
    - Education Department (email: education@gov.in)
  
  Instructions:
  - Always return the result in strict JSON format.
  - Use the key "departments".
  - For each department, return a list in the format:
    [ "Department Name", "Department Email", "Relevant structured sub-query for that department" ]
  - If the query relates to multiple departments, return an array of such lists.
  - Department names and emails must match exactly as listed above.
  - Do not include any explanation, only return JSON.
  
  Example:
  User query: "In our area government school has electricity issues and poor water quality."
  Output:
  {{
    "departments": [
      ["Electricity Department", "electricity@gov.in", "Resolve electricity issues in the government school"],
      ["Water Supply Department", "water@gov.in", "Fix poor water quality in the government school"],
      ["Education Department", "education@gov.in", "Government school has infrastructure problems affecting students"]
    ]
  }}

  if only one department is relevant, return the single department in the format:
  {{
    "departments": [
      ["Department Name", "Department Email", "Relevant structured sub-query for that department"]
    ]
  }}
  
  if the query is not correct or not related to any department, return the following format:
  {{
    "departments": ["police dept",police@gov.in,"fake quey file a complaint for this user"]
  }}
  
  Now classify the following query:
  {format_instructions}
  Query: {query}`
);

// ✅ Export the classification function
// Returns all classified departments (with email and subquery) and the original userquery
export async function classifyUserQuery(query: string): Promise<{
  userquery: string;
  classifications: {
    department: string;
    email: string | null;
    subquery: string | null;
  }[];
  raw?: AIResponse;
}> {
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

    // Robust parsing of departments array (collect all)
    const classifications: {
      department: string;
      email: string | null;
      subquery: string | null;
    }[] = [];
    const departments = (result as AIResponse)?.departments;

    if (Array.isArray(departments)) {
      // Two possible shapes:
      // 1) [ [name, email, subquery], ... ]
      // 2) [name, email, subquery]
      if (departments.length > 0) {
        if (Array.isArray(departments[0])) {
          for (const item of departments) {
            if (Array.isArray(item) && typeof item[0] === "string") {
              classifications.push({
                department: item[0] as string,
                email: typeof item[1] === "string" ? (item[1] as string) : null,
                subquery:
                  typeof item[2] === "string" ? (item[2] as string) : null,
              });
            }
          }
        } else if (typeof departments[0] === "string") {
          // Single flat array
          classifications.push({
            department: departments[0] as string,
            email:
              typeof departments[1] === "string"
                ? (departments[1] as string)
                : null,
            subquery:
              typeof departments[2] === "string"
                ? (departments[2] as string)
                : null,
          });
        }
      }
    }

    if (classifications.length === 0) {
      console.warn(
        "AI classification parsing failed; no valid departments found."
      );
    } else {
      console.log(
        `Parsed AI classified departments: ${classifications
          .map((c) => c.department)
          .join(", ")}`
      );
    }

    return {
      userquery: query,
      classifications,
      raw: result as AIResponse,
    };
  } catch (err) {
    console.error("Classification error:", err);
    throw err;
  }
}
