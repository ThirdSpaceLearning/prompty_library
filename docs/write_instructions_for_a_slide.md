# Write instructions for a slide

Each slide is formatted in markdown using the following template:

```markdown
# Slide {n}

## Step {n-1}

{Instruction n-1}

## Step {n}

{Instruction n}

## Step {n+1}

{Instruction n+1}

```

Each step is a single unit that represent specific instructions to scaffold the LLM intelligence. To help the LLM to better understand how to perform a task using the instructions, we are using a strict format that is parsed and interpreted by the AI tutor to build the final prompt.

## Instruction structure

### Say

A task must start always with the tag `Say:` followed by the utterance we want the LLM to pronouce. It's important to notice that this sentence is not paraphrased by the LLM, but pronounced as is.

Example: `Say: What is 2+2?`

### Visual Aid

Sometimes, the question is not explicit, refering to the content of the slide itself (For example: Can you give question A a go?). In this case is paramount to explain the LLM the context of the question. The tag is optional, but it really helps the LLM to avoid hallucinations when it has to guide students when they give a wrong answer.

Example: `(Visual Aid: question A asks to identify the tenths in the number 4.53)

### Write

With the introduction of components, the tutor can write into the slide. The instructions are used to send directly the message to Ably to render content into the slide. The tag is optional, but is should be used when we want the tutor to interact with a slide. The format is `{value} @ {componentName}` where `componentName` is the name assigned on Figma. It's possible to add multiple instructions within the same tag, if the tutor has to use multiple components.

Example:

- Components:
  - `FM_a{1} @ text [The digit in the tens place is $1 and it has the value of $2]`
  - `FM_a{2} [The digit in the tens place is $1 and it has the value of $2]`
- `(Write: 2 @ FM_a{1}, 20 @ FM_a{2})

### Correct Answer

LLMs are not great at Maths. Even the most capable LLMs struggle with simple questions. Without strict instructions, even GPT-4o can hallucinate. For this reason, we are always providing the correct answer to any question. The tag is optional, but it should always being included when the task includes a question.

Example: `(Correct Answer: 0.05)`

### Correct Idea

Sometimes we need to check if the student's answer aligns with the main idea of what we want the tutor to consider. In this case we can't use the `Correct Answer` tag, because the check is too strict (0.2 is different from 0.02). This tag is used to implement a broad check rather than an exact match.

Example: `(Correct Idea: Any positive number)`

### Common Misconceptions

For the same reason we are stating the Correct Answer, sometimes, having the Common Misconception can help the LLM to avoid hallucinations. It's important to notice that LLMs work with tokens, not with numbers, it means the tokens for 0.5 (`[15, 13, 20]`) and 0.05 (`[15, 13, 2304]`) are very close and can lead, sporadicly to misinterpret a right answer for a wrong answer. The tag is optional, and it should be used only if LLM really struggle to indentify an answer as correct or incorrect.

Example: `(Common Misconceptions: 5, 0.5, 0.04, 0.005)`

### Support Slide

By default, when the student gets the answer wrong, we ask the LLM to pose guided questions to help the student to get to the right answer. Sometimes we want to scaffold the teaching by adding a dedicated support slide. The tag is optional, and it should be used only when we want the LLM to jump to a specific slide when the student gives a wrong answer. The tag accepts the position of the slide as a parameter.

Example: `(Support Slide: 4)`

### Support Question

If the instruction doesn't include a Support Slide and we want to scaffold the questions posed to the student, we can include the Support Question tag to force the LLM to pose the support questions we want, instead of the one decided by the AI. The tag is optional, and it should be used when we want the LLM to follow our directions when the student gives the wrong answer. The tag accepts a list of support questions separated by comma.

Example: `(Support Question: Which word helps you identify which calculation to do? The answer is 'altogether' which tells you that you need to add. Which column will change? The answer is the tenths. Which column will not change? The answer in the ones)`

### Next Slide

By default, the session flows linearly from step to step, from slide to slide, from LO to LO. We use the Next Slide tag when we want the LLM to jump to a different slide, in case of correct answer. The tag is optional, and it should be used only when we want the LLM to jump to a specific slide when the student gives the correct answer. The tag accepts the position of the slide as a parameter.

Example: `(Next Slide: 6)`

## Complete Example

```text
# Slide 1

## Step 1

Say: How far did Terra cycle altogether? (Visual Aid: The question show 3 houses, the first and the second are connected by a line with the 7.3Km label. The second and the third are connected with a line with the 0.6Km label.)(Correct Answer: 7.9km)(Common Misconception: 7.3Km, 0.6Km)(Support Question: Which word helps you identify which calculation to do? The answer is 'altogether' which tells you that you need to add. Which column will change? The answer is the tenths. Which column will not change? The answer in the ones)(Support Slide: 4)(Next Slide: 6)
```

## Formatting Tips

- Make sure to write tags using the first letter of each word in uppercase.
- Do not include any space between tags.
- Do not add any punctuation after the tags.
