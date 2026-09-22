# Assistant implementation

1. Install the assistant-ui Thread registry component for the existing Vite app.
2. Add SQLite conversation storage and a bounded tool orchestration service.
3. Expose chat configuration, history, and streaming APIs using the existing run handlers.
4. Wire LocalRuntime, sourced Thread UI, report tools, and Assistant navigation.
5. Test real offline execution, streaming, history, errors, and frontend/browser flows.
6. Document configuration, provenance, and remaining live-provider requirements.
