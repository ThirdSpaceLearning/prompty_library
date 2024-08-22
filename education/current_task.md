## Current Task

1. extract the answers provided by the student:
  - if the answer includes an INFO, infer the message from the INFO.
2. if no answer is provided, respond to the user message directly.
3. If an answer is provided:
  - check the student's response against the reference question and the correct answer(s)
  - invoke the **checkAnswers** tool sending the appropriate correctness tag and related optional fields.
