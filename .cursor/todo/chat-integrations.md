# TODO: Chat integrations

**Status**: planned
**Area**: domain
**Priority**: medium

## Context

Chat messages should link to domain entities (calendar events, blog drafts, media assets, tasks) via ChatMessageLink without hard-coded UI coupling.

## Problem

Integrations are not implemented in UI or domain. There is no unified attachment UI or action dispatcher in chat.

## Goal

Enable optional attachments/actions in chat that reference domain entities (calendar, blog, media, tasks) while keeping chat UI generic.

## Scope

- Define UI attachment renderer for chat messages (entityType + entityId + label).
- Add action scaffolding for assistant-created drafts/events/tasks.
- Support deep links to related modules.

## Non-goals

- No automatic permissions propagation between chat and other modules.
- No AI tool execution in MVP.

## Acceptance criteria

- Chat can render a neutral attachment block for known entity types.
- Clicking attachment navigates to the target module.
- Actions are wired through use-cases or services, not components.
