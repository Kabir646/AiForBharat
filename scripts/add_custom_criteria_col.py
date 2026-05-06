import sys
import os

# Add the parent directory to sys.path to be able to import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import backend.db_config as db_config

def add_custom_criteria_column():
    conn = db_config.get_connection()
    cursor = db_config.get_cursor(conn, dict_cursor=False)
    try:
        cursor.execute("ALTER TABLE projects ADD COLUMN custom_criteria JSONB")
        conn.commit()
        print("Successfully added custom_criteria column to projects table")
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
    finally:
        cursor.close()
        db_config.release_connection(conn)

if __name__ == "__main__":
    add_custom_criteria_column()
