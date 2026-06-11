# Run chasi-ts

Launch the chasi-ts development server and verify it starts cleanly.

## Steps

1. Run `npm run dev` in the background to start the TypeScript watch + hot-reload server.
2. Wait for the server to finish compiling and print its ready/listening message (look for a port line or "initialized" in stdout).
3. Make a test request with `curl -s http://localhost:<port>/` (use the port from `.env` or default 3000) to confirm the server responds.
4. Report the port and any startup warnings or errors.

## Notes

- Entry point after build: `dist/server.js`
- Default port is set in `.env` (copy from `template.env` if missing)
- Use `npm run dev:html` instead if HTML/CSS/JS hot-reload is needed
- Run `npm run test` to execute the Vitest suite without starting the server
- If the DB isn't running, connection errors are expected at startup but the HTTP server should still bind
