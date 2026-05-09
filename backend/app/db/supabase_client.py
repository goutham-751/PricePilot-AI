"""
Supabase Client Mock — Local SQLite drop-in replacement.
This intercepts standard Supabase Python SDK queries and runs them locally.
"""

from pydantic import BaseModel
from typing import Any
from db.sqlite_db import execute_query
import uuid

class MockResponse(BaseModel):
    data: list[dict]

class MockTableQuery:
    def __init__(self, table_name: str):
        self.table_name = table_name
        self._select = "*"
        self._eqs = []
        self._gtes = []
        self._ltes = []
        self._order = None
        self._limit = None
        self._action = "select"
        self._payload = None

    def select(self, fields: str):
        self._action = "select"
        self._select = fields
        return self

    def insert(self, payload: dict | list[dict]):
        self._action = "insert"
        self._payload = payload if isinstance(payload, list) else [payload]
        return self

    def update(self, payload: dict):
        self._action = "update"
        self._payload = payload
        return self
        
    def delete(self):
        self._action = "delete"
        return self

    def eq(self, column: str, value: Any):
        self._eqs.append((column, value))
        return self

    def gte(self, column: str, value: Any):
        self._gtes.append((column, value))
        return self

    def lte(self, column: str, value: Any):
        self._ltes.append((column, value))
        return self

    def order(self, column: str, desc: bool = False):
        self._order = (column, "DESC" if desc else "ASC")
        return self

    def limit(self, max_limit: int):
        self._limit = max_limit
        return self

    def execute(self):
        if self._action == "select":
            return self._execute_select()
        elif self._action == "insert":
            return self._execute_insert()
        elif self._action == "update":
            return self._execute_update()
        elif self._action == "delete":
            return self._execute_delete()

    def _execute_select(self):
        query = f"SELECT {self._select} FROM {self.table_name}"
        where_clauses = []
        params = []

        for col, val in self._eqs:
            where_clauses.append(f"{col} = ?")
            params.append(val)
        
        for col, val in self._gtes:
            where_clauses.append(f"{col} >= ?")
            params.append(val)
            
        for col, val in self._ltes:
            where_clauses.append(f"{col} <= ?")
            params.append(val)

        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)

        if self._order:
            query += f" ORDER BY {self._order[0]} {self._order[1]}"

        if self._limit:
            query += f" LIMIT {self._limit}"

        rows = execute_query(query, tuple(params))
        return MockResponse(data=rows)

    def _execute_insert(self):
        inserted = []
        for row in self._payload:
            # Generate UUID if not provided
            if 'id' not in row:
                row['id'] = str(uuid.uuid4())
                
            cols = list(row.keys())
            placeholders = ["?"] * len(cols)
            vals = list(row.values())
            
            query = f"INSERT INTO {self.table_name} ({', '.join(cols)}) VALUES ({', '.join(placeholders)})"
            execute_query(query, tuple(vals))
            inserted.append(row)
            
        return MockResponse(data=inserted)

    def _execute_update(self):
        set_clauses = []
        set_params = []
        for k, v in self._payload.items():
            set_clauses.append(f"{k} = ?")
            set_params.append(v)
            
        query = f"UPDATE {self.table_name} SET {', '.join(set_clauses)}"
        
        where_clauses = []
        where_params = []
        for col, val in self._eqs:
            where_clauses.append(f"{col} = ?")
            where_params.append(val)
            
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
            
        execute_query(query, tuple(set_params + where_params))
        # Update rarely returns full data in Mock without a select, return empty
        return MockResponse(data=[self._payload])
        
    def _execute_delete(self):
        query = f"DELETE FROM {self.table_name}"
        
        where_clauses = []
        where_params = []
        for col, val in self._eqs:
            where_clauses.append(f"{col} = ?")
            where_params.append(val)
            
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
            
        execute_query(query, tuple(where_params))
        return MockResponse(data=[])

class MockSupabaseClient:
    def table(self, table_name: str):
        return MockTableQuery(table_name)

supabase = MockSupabaseClient()
print("SQLite Mock Supabase client initialized successfully")
