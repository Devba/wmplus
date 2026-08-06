# Rules for AI Agents

## Critical Rules

1. **ONLY use these tools**: bash, edit, glob, grep, read, question, task, todowrite, webfetch, write
2. **NEVER call**: unknown, invalid, or any other tool not in the list above
3. **Do one operation at a time** when editing files - don't batch multiple edits in parallel
4. **Verify tool calls** before executing - if unsure, use bash to check first

## File Editing Guidelines

- Read the file first before editing
- Make one change at a time
- After editing, verify with a quick check
- Don't try to do 5+ edits in a single response

## General Guidelines

- Be concise in responses
- Don't repeat the same operations
- If something fails, analyze and fix before retrying
- Prefer bash for quick checks over reading full files
