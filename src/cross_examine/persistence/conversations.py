"""Server-owned conversation history; clients cannot supply assistant evidence."""

from __future__ import annotations

import json
from typing import Any

from cross_examine.persistence.database import Database
from cross_examine.persistence.runs import _timestamp


class ConversationRepository:
    def __init__(self, database: Database) -> None:
        self.database = database

    def list(self) -> list[dict[str, Any]]:
        with self.database.connect() as connection:
            return [
                dict(row)
                for row in connection.execute(
                    "SELECT * FROM conversations ORDER BY updated_at DESC LIMIT 100"
                )
            ]

    def messages(self, conversation_id: str) -> list[dict[str, Any]]:
        with self.database.connect() as connection:
            rows = connection.execute(
                "SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY rowid",
                (conversation_id,),
            ).fetchall()
        return [
            {"id": row["id"], "role": row["role"], "content": json.loads(row["content_json"])}
            for row in rows
        ]

    def start(self, conversation_id: str, message_id: str, text: str) -> None:
        now = _timestamp()
        with self.database.connect() as connection:
            connection.execute(
                "INSERT INTO conversations VALUES (?, ?, ?) "
                "ON CONFLICT(id) DO UPDATE SET updated_at = excluded.updated_at",
                (conversation_id, text[:80], now),
            )
            connection.execute(
                "INSERT INTO chat_messages VALUES (?, ?, 'user', ?, ?)",
                (message_id, conversation_id, json.dumps([{"type": "text", "text": text}]), now),
            )

    def save(self, conversation_id: str, message_id: str, content: list[dict]) -> None:
        with self.database.connect() as connection:
            connection.execute(
                "INSERT INTO chat_messages VALUES (?, ?, 'assistant', ?, ?) "
                "ON CONFLICT(conversation_id, id) DO UPDATE SET content_json = excluded.content_json",
                (message_id, conversation_id, json.dumps(content), _timestamp()),
            )
            connection.execute(
                "UPDATE conversations SET updated_at = ? WHERE id = ?",
                (_timestamp(), conversation_id),
            )
