# System Prompt

The system prompt is structured as following:

```markdown
# System Interaction Guidelines

{tutor_persona}
{pre_task_engagement}
{general_tutoring_guidelines}
## Important Reminders
{reminders}
## Current Status:
{current_status}
## Current Task:
{current_task}
## Chat Summary:
{chat_summary}
```

Each of the following prompts can include the following macros:

- ${config.name} - The student name
- ${config.yearId} - The student year group
- ${config.profile} - The student profile
- ${config.teacherComment} - The student profile

## Tutor Persona

The [tutor persona](../education/tutor.md) prompt includes information about the tutor and the student.

## Pre Task Engagement

This section of the prompt scaffolds the very first interaction in a session. For example we can guide the tutor to welcome students for their very [first session](../education/first_session_with_skye.md) or having something different for [ongoing sessions](../education/ongoing_sessions_with_skye.md).

A few additional macro are available in this section:

- ${config.programme.summary} - The full list of each session learning outcome.
- ${config.programme.learningObjectives} - A list of lessons to be taought during the session.
- ${config.programme.lastSession.outcome} - The learning outcome for the last session.
- ${config.programme.lastSession.assessmentResult} - The result of the last lesson assessment

## General Tutoring Guidence

This prompt includes a list of guidance for the tutor to use during a session. It scaffolds the tutor's behaviour across the session and it should include all the rules we want the tutor to follow.

## Important Reminders

This section of the prompt instructs the tutor about important facts regarding the student ongoing programme. For example the tutor may want to remind the student to [complete the kickoff quiz](../education/kickoff_quiz_not_completed.md) or acknowledge the fact the student has [just completed the kickOff quiz](../education/kickoff_quiz_just_completed.md).

A few additional macro are available in this section:

- ${config.assessment.completedAt} - When the student has completed the kickOff quiz.
- ${config.assessment.insight} - A summary of the assessment result.
- ${config.assessment.results} - The full list of questions with the student's answers.

## Current Status

The current status informs the tutor about the status of the session. It's formatted as follow:

```text
Current Learning Objective: 1/4, Current Slide: 1/8, Current Step: 1/2
```

The status can be refererred in other system prompts, but, generally, is used automatically the the tutor to drive its own behaviour during the session.

## Current Task

The instructions for each slide are manipulated by the system to create the current task prompt according to the following logic:

```pseudocode
You have just said: {{utterance}}
Do not repeat the question.
You must respond only with "<ACK>" without any further comment and wait for the student to respond.
Only after the student has responded,

IF (!correctAnswer)
  invoke the **moveToNextStep** tool using your response as a message

ELSE
  check their response against "{{correctAnswer}}"
  
  IF (visualAid)
    Do not repeat or display this information to the student, but use it to enhance your understanding of the question: The learning slide shows {{visualAid}}.
  END

  
  IF (nextSlide)
    **If the answer is correct**: You must output <CORRECT> and invoke the **jumpToSlide** tool with index {{nextSlide}} and your praise for their understanding as the message.
  ELSE
    **If the answer is correct**: You must output <CORRECT> and invoke the **moveToNextStep** tool using your praise for their understanding as the message.\n
  END
  
  IF (supportSlide)
    **If the answer is incorrect**: You must output <INCORRECT> and invoke the **jumpToSlide** tool with index {{supportSlide}} and a supportive message acknowledging the mistake.
  ELSE if (supportQuestion)
    **If the answer is incorrect**: You must ask {{supportQuestion}} to lead the student to the correct answer. When the student get to the right answer, invoke the **moveToNextStep** using your acknoledge as a message.
  ELSE
    **If the answer is incorrect**: You must pose guided questions to lead the student to the correct answer. When the student get to the right answer, invoke the **moveToNextStep** using your acknoledge as a message.
  END
  
  IF (commonMisconceptions)
    Some examples of incorrect answers are: {{commonMisconceptions}}
  END

  **if the answer is completely nonsensical**: You must advise the student to focus on the question.
END
```

The above pseudocde describe how Skye builds the current task based on the tags added to the instructions.

## Chat Summary

Chat Summary is created and updated everytime Skye move from a slide to another. Having the conversation (short memory) summarised helps with:

- Reduce the cost - smaller context window.
- Increase the focus - the task is more prominent than the whole conversation.
- Keep the context - the tutor is aware of any important facts happened in the session.
