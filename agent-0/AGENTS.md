# Botpress ADK Agent

> This project is built with the **Botpress Agent Development Kit (ADK)** — a TypeScript-first framework for building AI agents.

## Key Files

- `agent.config.ts` — Agent configuration, models, state schemas, and dependencies
- `src/conversations/` — Message handlers (primary user interaction)
- `src/workflows/` — Long-running background processes
- `src/tools/` — AI-callable functions
- `src/actions/` — Reusable business logic
- `src/knowledge/` — RAG knowledge base sources
- `src/tables/` — Database table definitions
- `src/triggers/` — Event-based triggers

## Development

```bash
adk dev      # Start dev server with hot reload
adk build    # Build and generate types
adk deploy   # Deploy to Botpress Cloud
adk chat     # Chat with your agent in the terminal
```

## CLI Commands (preferred interface)

Use CLI commands with `--format json` for structured output.

### Debugging & Testing

| Command                                       | Use for                                                                                  |
| --------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `adk check --format json`                     | Offline project validation — catch config and schema errors                              |
| `adk chat --single "<message>" --format json` | Test messages to the running bot (use --conversation-id <id> to continue a conversation) |
| `adk logs [error\|warning] --format json`     | Query dev server logs, build output, and errors                                          |
| `adk traces [filters...] --format json`       | Query trace spans for debugging conversations/workflows                                  |
| `adk status --format json`                    | Get project info: name, primitives, and integrations                                     |

### Integrations

| Command              | Use for                                           |
| -------------------- | ------------------------------------------------- |
| `adk list`           | List installed integrations                       |
| `adk search <query>` | Search available integrations on the Botpress Hub |
| `adk info <name>`    | Get detailed info about an integration            |
| `adk add <name>`     | Add an integration (updates agent.config.ts)      |

### Workflows

| Command                                              | Use for                      |
| ---------------------------------------------------- | ---------------------------- |
| `adk workflows list --format json`                   | Discover available workflows |
| `adk workflows inspect <name> --format json`         | Get workflow input schema    |
| `adk workflows run <name> '<payload>' --format json` | Execute a workflow           |

> **Tip:** The dev server must be running (`adk dev`) for testing and trace tools to work.

### Skills

For detailed ADK documentation, install the skills (use `bunx` if `bun.lockb` exists, otherwise `npx`): `bunx skills add botpress/skills -s '*' -a codex claude-code -y`. Available skills: `adk`, `adk-debugger`, `adk-evals`, `adk-integrations`, `adk-frontend` & more.

## Project Overview

<!-- Describe what your agent does -->

## Architecture & Conventions

<!-- Add project-specific patterns, decisions, and conventions -->

## Notes

<!-- Add anything else relevant to your project -->
