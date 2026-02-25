# Accra Vibe Planner Refactor Roadmap

## Phase 1 (Completed)
- Centralize app constants and environment-sensitive settings in `config/appConfig.ts`.
- Extract plan parsing into `domain/planner/planParser.ts`.
- Extract shared date/time helpers into `utils/dateTime.ts`.
- Rewire components/hooks to use shared modules.
- Add initial test scaffolding with Vitest and parser unit tests.

## Phase 2 (Next)
- Introduce server-side BFF for:
  - Gemini API calls
  - Payment verification
  - Subscription/rate-limit enforcement
- Replace frontend mock payment verification with real backend endpoint.
- Move plan history and usage counters from `localStorage` to server persistence.

## Phase 3
- Replace free-form LLM output with strict JSON schema and runtime validation.
- Add parser fallback and telemetry for schema failures.
- Add resilient retry/backoff for provider calls.

## Phase 4
- Split workflow orchestration into dedicated modules:
  - `features/planner/workflow`
  - `features/planner/services`
  - `features/billing`
  - `shared/storage`
- Add domain-level tests for state transitions and error paths.

## Phase 5
- Harden security posture:
  - CSP and allowed origin policy
  - Reduce runtime CDN dependencies
  - Add audit logging around billing state changes
