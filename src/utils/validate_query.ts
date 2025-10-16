import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

interface response {
  department: string;
  departmentId: string;
  email: string;
  subquery?: string;
}
const model = new ChatGroq({
  model: "llama-3.1-8b-instant",
  temperature: 0,
  apiKey: process.env.GROQ_API_KEY,
});

const parser = new JsonOutputParser();
const prompt = ChatPromptTemplate.fromTemplate(
  `You are a government query classifier.
  
  Your task: Classify the given user query into one or more of the following departments:
  Instructions:
  - Always return the result in strict JSON format.
  - Use the key "departments".
  - For each department, return a list in the format:
    {{department: "Department Name", departmentId: "Department Id", email: "Department Email", subquery: "Relevant structured sub-query for that department"}}
  - If the query relates to multiple departments, return an array of such lists.
  - Department names and emails must match exactly as listed above.
  - Do not include any explanation, only return JSON.
  - The department Id is the respective department id in the given input.
  
  Example:
  User query: "In our area government school has electricity issues and poor water quality."
  Output:
  {{
    "departments": [
      {{"department": "Electricity Department", "departmentId": "68e51e25bea83348a3621adf", "email": "electricity@gov.in", "subquery": "Resolve electricity issues in the government school"}},
      {{"department": "Water Supply Department", "departmentId": "68e51e25bea83348a3621ae1", "email": "water@gov.in", "subquery": "Fix poor water quality in the government school"}},
      {{"department": "Education Department", "departmentId": "68e51e25bea83348a3621ae2", "email": "education@gov.in", "subquery": "Government school has infrastructure problems affecting students"}}
    ]
  }}

  if only one department is relevant, return the single department in the format:
  {{
    "departments": [
      {{"department": "Department Name", "departmentId": "68e51e25bea83348a3621adf", "email": "Department Email", "subquery": "Relevant structured sub-query for that department"}}
    ]
  }}
  
  if the query is not correct or not related to any department, return the following format:
  {{
    "departments": [{{"department": "police dept", "68e51e25bea83348a3621adf": "police", "email": "police@gov.in", "subquery": "fake quey file a complaint for this user"}}]
  }}
  
  Now classify the following query:
  {format_instructions}
  Query: {query}
  Available Departments: {departments}`
) as ChatPromptTemplate<{
  format_instructions: string;
  query: string;
  departments: string;
}>;

export async function classifyUserQuery(
  query: string,
  departments: any
): Promise<{
  userquery: string;
  classifications: {
    department: string;
    email: string | null;
    subquery: string | null;
    departmentId: string | null;
  }[];
  raw?: any;
}> {
  try {
    // Check if GROQ API key is available
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not found in environment variables");
    }

    const partialedPrompt = await prompt.partial({
      format_instructions: parser.getFormatInstructions(),
    });

    const chain = partialedPrompt
      .pipe(model)
      .pipe(async (msg) => msg?.content ?? msg)
      .pipe(parser as any);

    const result = await chain.invoke({
      query,
      departments: JSON.stringify(departments),
    });

    const classifications: {
      department: string;
      email: string | null;
      subquery: string | null;
      departmentId: string | null;
    }[] = [];
    const departmentsResult: response[] = (result as any)?.departments || [];
    if (Array.isArray(departmentsResult)) {
      if (departmentsResult.length > 0) {
        for (const item of departmentsResult) {
          classifications.push({
            department: item.department,
            email: item.email,
            subquery: item.subquery || null,
            departmentId: item.departmentId,
          });
        }
      }
    }
    console.log(classifications);
    return {
      userquery: query,
      classifications,
      raw: result,
    };
  } catch (err) {
    console.error("Classification error:", err);
    throw err;
  }
}
