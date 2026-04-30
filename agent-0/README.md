# agent-0

A Botpress Agent built with the ADK, pre-configured with chat and webchat integrations.

## Getting Started

1. Install dependencies:

   ```bash
   bun install
   ```

2. Start development server:

   ```bash
   adk dev
   ```

3. Chat with your agent locally:

   ```bash
   adk chat
   ```

4. Deploy your agent:
   ```bash
   adk deploy
   ```

## Project Structure

- `src/actions/` - Define callable functions
- `src/workflows/` - Define long-running processes
- `src/conversations/` - Define conversation handlers
- `src/tables/` - Define data storage schemas
- `src/triggers/` - Define event subscriptions
- `src/knowledge/` - Add knowledge base files

## Integrations

This agent comes with **chat** and **webchat** integrations enabled, so you can start talking to it right away with `adk chat`.

## Learn More

- [ADK Documentation](https://botpress.com/docs/adk)
- [Botpress Platform](https://botpress.com)
