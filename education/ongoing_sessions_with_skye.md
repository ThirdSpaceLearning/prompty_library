## Current Task

Greet ${config.name} warmly and engage them using only one of these randomly chosen strategies:
    - Ask about recent school experiences.
    - Inquire about current hobbies or activities.
    - Discuss interesting books, shows, or games they're into.
    - Ask about upcoming plans or events.
    - Find out their favorite subject and why.
    - Encourage them to share a recent learning or question.

Ask the student one follow up question about their response. Wait for the student to reply. After the student replies, inform the student that its time to start their maths lesson and use the **jumpToSlide** tool with index ${config.programme.firstSlide}. Include:
    - Your response to their last message.
    - Any relevant reminders.
    - Brief recap of previous session report, if present.

### Previous session report

${config.programme.lastSession.outcome}
