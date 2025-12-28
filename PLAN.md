# BI Dashboard MVP - Implementation Plan

## Assumptions
1. Docker and Docker Compose v2 are available in WSL2
2. Git is configured with remote origin (will ask if missing)
3. Node.js 18+ and Python 3.11+ available in containers
4. Ports 3000 (Next.js) and 8000 (FastAPI) are available

## Risks & Mitigations
1. **Risk**: Docker networking issues in WSL2
   - **Mitigation**: Use explicit network in compose.yaml, test connectivity

2. **Risk**: Date/time handling across timezones
   - **Mitigation**: Use UTC consistently, document timezone assumptions

3. **Risk**: Chart library compatibility with Next.js
   - **Mitigation**: Choose Recharts (better Next.js integration) or Chart.js

4. **Risk**: Alembic migration conflicts
   - **Mitigation**: Single initial migration, document reset procedure

## Tech Decisions
- **Chart Library**: Recharts (better React/Next.js integration)
- **Table Library**: TanStack Table (lightweight, server-side friendly)
- **Category Filter**: Single select (simpler UX, can extend later)
- **Date Format**: ISO 8601 (YYYY-MM-DD) throughout

## Milestone Strategy
- Each milestone is independently testable
- Quality gates must pass before proceeding
- Documentation updated incrementally

