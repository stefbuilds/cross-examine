# Embedded Cross-Examine assistant

Integrate assistant-ui into the existing React/Vite app with a custom Python
backend, as requested. The assistant can start a real verification from a repo
and refs or public GitHub PR, run the offline hero, inspect saved reports, list
runs, and inspect the pinned corpus. Missing inputs are clarified in conversation.

The existing five-stage pipeline remains the executor and sole verdict authority.
The chat model chooses schema-constrained tools and explains results. Report cards
render persisted reports and exact receipts; generated prose is labeled explanation.
No shell tool, model verdict, or automatic code mutation is introduced.

Use the upstream assistant-ui Thread and a streaming LocalRuntime adapter. FastAPI
streams text, tool/progress updates, errors, and completion. Conversations and tool
results are saved in SQLite. Reloading restores history; cancelling stops the chat
response, while an already submitted verification remains available in Runs.

The backend loads the root .env.local without overriding process variables. A
missing key is visible and leaves explicit offline demo/report commands functional.
Hosted mode retains its existing fixture-only restriction. Keys never enter Vite.

Verification: backend integration tests for tools, persistence, errors, duplicate
requests, hosted restrictions, and real hero execution; frontend build and tests;
browser chat submission, streamed updates, receipt expansion, follow-up, reload,
and narrow viewport. Live OpenAI streaming is separately checked when configured.
