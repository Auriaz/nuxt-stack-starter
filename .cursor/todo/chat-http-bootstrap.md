# TODO: Chat HTTP bootstrap endpoints

**Status**: planned
**Area**: server
**Priority**: high

## Context

Frontend chat UI needs initial threads and message history. Current WS contract does not provide bootstrap lists.

## Problem

Missing or unverified HTTP endpoints for thread list and message history can block chat UI from loading real data.

## Goal

Add minimal read-only endpoints:

- GET /api/chat/threads
- GET /api/chat/threads/:id/messages?cursor=...

## Scope

- Valibot validation for inputs.
- DTO mapping using shared chat types.
- Permission check: chat.use.

## Non-goals

- No thread creation or invite flows.
- No message editing or deletion.

## Acceptance criteria

- UI can load thread list and history without mock data.
- Error format aligns with API standard.
