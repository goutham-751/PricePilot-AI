import sqlite3
import os
import logging
from pathlib import Path

logger = logging.getLogger("sqlite_db")

DB_PATH = Path(os.path.dirname(__file__)) / "local_database.sqlite"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def execute_query(query: str, params: tuple = ()):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(query, params)
        if query.strip().upper().startswith("SELECT"):
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        else:
            conn.commit()
            return cursor.lastrowid
    except Exception as e:
        logger.error(f"DB Error: {e} | Query: {query}")
        raise
    finally:
        conn.close()
