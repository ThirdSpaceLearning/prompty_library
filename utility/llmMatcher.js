/* global expect */
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const SYSTEM_PROMPT = `
You're building an automatic Quality Assurance (QA) system for learning content instructions. Given an instruction in a specific format, your task is to evaluate whether the correct answer provided is accurate, using both the information from the utterance and the visual aid. The instruction format is as follows:

Say: [Utterance](Correct Answer: [Answer])(Visual Aid: [Description])

Your system needs to evaluate the instruction and provide structured feedback. Specifically, it should check the following criteria:

**Correct Answer:** Ensure that the provided correct answer is accurate based on the information provided in the utterance and the visual aid. This should be checked step by step: 
    1.1. Identify the problem or question presented in the utterance. 
    1.2. Extract relevant information from both the utterance and the visual aid to solve the problem or answer the question. 
    1.3. Calculate the correct answer based on the extracted information. 
    1.4. Compare the calculated correct answer with the one provided in the instruction. 
    1.5. If the calculated correct answer matches the one provided in the instruction, mark it as accurate. Otherwise, mark it as inaccurate.

Your task is to generate a JSON response indicating whether the correct answer provided in the instruction is accurate or not, along with any relevant details for the evaluation, including the step-by-step process.

**Example Instruction:**

Say: What should we do next ? (Correct Answer: Check how many ten counters are missing) (Visual Aid: The number five thousand, four hundred and sixty - three represented in place value counters, but with some counters ripped out.The visible counters include one "1,000" counter, two "100" counters, three "10" counters, and two "1" counters.The student has already identified the missing thousands and hundreds place value counters)

**Instructions for Response:**
- Make sure to complete the step-by-step evaluation before creating the JSON.
- Provide a JSON structure containing the evaluation for the correct answer.
- Include additional details explaining the evaluation for the correct answer, including the step-by-step process and how the visual aid was utilized.
- Use a boolean value to indicate whether the correct answer is accurate or not.`

const model = new ChatOpenAI({
  temperature: 0,
  model: "gpt-4o",
});


const DetailsSchema = z.array(z.string().describe("The step performed to calculate the correct answer and set the correct_answer_accurate field"));

const JSONSchema = z.object({
  details: DetailsSchema,
  provided_correct_answer: z.string().describe("The correct answer provided in the instructions"),
  accurate_correct_answer: z.string().describe("The accurate correct answer calculated in the process"),
  correct_answer_accurate: z.boolean().describe("Whether the provided correct answer is accurate or not")
});

const modelWithStructuredOutput = model.withStructuredOutput(JSONSchema);

// Define the custom matcher
expect.extend({
  async toHaveTheCorrectAnswer(instructions) {

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_PROMPT],
      ["human", instructions],
    ]);
    const chain = prompt.pipe(modelWithStructuredOutput);
    const responseJson = await chain.invoke({});

    if (responseJson.correct_answer_accurate) {
      return {
        message: () => `expected "${instructions}" to not have a correct answer ${responseJson.provided_correct_answer} - should be ${responseJson.accurate_correct_answer}:\n${responseJson.details.join('\n')}`,
        pass: true
      }
    } else {
      return {
        message: () => `expected "${instructions}" to have a correct answer ${responseJson.provided_correct_answer} - should be ${responseJson.accurate_correct_answer}:\n${responseJson.details.join('\n')}`,
        pass: false
      }
    }
  }
})
