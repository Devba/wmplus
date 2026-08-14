# Rules for AI Agents

## Allowed tools
- **Read/Search**: read, glob, grep, webfetch, skill
- **Edit**: write, edit (one change at a time; read the file first)
- **Run**: bash (for quick checks/commands)
- **Plan**: todowrite, question, task

## Workflow
1. Read a file before editing it.
2. Make one change at a time and verify after each edit.
3. Prefer grep/glob over bash for searches.
4. If something fails, analyze the error before retrying.
5. Be concise; don't repeat the same operations.
