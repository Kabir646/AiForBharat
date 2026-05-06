"""
reset_db.py — Drop all tables and recreate fresh with correct schema.
Run from project root: python reset_db.py
"""

import psycopg2
import sys

# Neon DB credentials
DB_CONFIG = {
    'host': 'ep-fragrant-shadow-aold7wx8.c-2.ap-southeast-1.aws.neon.tech',
    'port': 5432,
    'database': 'neondb',
    'user': 'neondb_owner',
    'password': 'npg_yCULs0WvMX9I',
    'sslmode': 'require'
}

def reset_db():
    print("Connecting to Neon DB...")
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = False
    cursor = conn.cursor()

    try:
        print("Dropping all existing tables...")
        cursor.execute("""
            DROP TABLE IF EXISTS comparison_messages CASCADE;
            DROP TABLE IF EXISTS comparison_chat_pdfs CASCADE;
            DROP TABLE IF EXISTS comparison_chats CASCADE;
            DROP TABLE IF EXISTS messages CASCADE;
            DROP TABLE IF EXISTS client_dprs CASCADE;
            DROP TABLE IF EXISTS dprs CASCADE;
            DROP TABLE IF EXISTS projects CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        """)
        print("✓ All tables dropped")

        print("Creating tables with correct schema...")

        # projects
        cursor.execute("""
            CREATE TABLE projects (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                state TEXT NOT NULL,
                scheme TEXT NOT NULL,
                sector TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL,
                comparison_result TEXT,
                comparison_generated_at TIMESTAMP,
                compliance_weights JSONB
            )
        """)
        print("✓ projects")

        # dprs — includes cloudinary columns
        cursor.execute("""
            CREATE TABLE dprs (
                id SERIAL PRIMARY KEY,
                project_id INTEGER REFERENCES projects(id),
                filename TEXT NOT NULL,
                original_filename TEXT NOT NULL,
                filepath TEXT NOT NULL,
                uploaded_file_ref TEXT NOT NULL,
                upload_ts TIMESTAMP NOT NULL,
                summary_json TEXT,
                client_id INTEGER,
                status TEXT DEFAULT 'completed',
                admin_feedback TEXT,
                feedback_timestamp TIMESTAMP,
                validation_flags TEXT,
                cloudinary_url TEXT,
                cloudinary_public_id TEXT
            )
        """)
        cursor.execute("CREATE INDEX idx_original_filename ON dprs(original_filename)")
        print("✓ dprs (with cloudinary_url, cloudinary_public_id)")

        # messages
        cursor.execute("""
            CREATE TABLE messages (
                id SERIAL PRIMARY KEY,
                dpr_id INTEGER NOT NULL REFERENCES dprs(id),
                role TEXT NOT NULL,
                text TEXT NOT NULL,
                timestamp TIMESTAMP NOT NULL
            )
        """)
        print("✓ messages")

        # comparison_chats
        cursor.execute("""
            CREATE TABLE comparison_chats (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                created_ts TIMESTAMP NOT NULL
            )
        """)
        print("✓ comparison_chats")

        # comparison_chat_pdfs
        cursor.execute("""
            CREATE TABLE comparison_chat_pdfs (
                id SERIAL PRIMARY KEY,
                comparison_chat_id INTEGER NOT NULL REFERENCES comparison_chats(id),
                dpr_id INTEGER NOT NULL REFERENCES dprs(id),
                UNIQUE (comparison_chat_id, dpr_id)
            )
        """)
        print("✓ comparison_chat_pdfs")

        # comparison_messages
        cursor.execute("""
            CREATE TABLE comparison_messages (
                id SERIAL PRIMARY KEY,
                comparison_chat_id INTEGER NOT NULL REFERENCES comparison_chats(id),
                role TEXT NOT NULL,
                text TEXT NOT NULL,
                timestamp TIMESTAMP NOT NULL
            )
        """)
        print("✓ comparison_messages")

        # users
        cursor.execute("""
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                name TEXT,
                username TEXT,
                created_at TIMESTAMP NOT NULL
            )
        """)
        cursor.execute("CREATE UNIQUE INDEX idx_users_email ON users(email)")
        print("✓ users")

        # client_dprs
        cursor.execute("""
            CREATE TABLE client_dprs (
                id SERIAL PRIMARY KEY,
                client_id INTEGER NOT NULL REFERENCES users(id),
                project_name TEXT NOT NULL,
                dpr_filename TEXT NOT NULL,
                original_filename TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Review',
                created_at TIMESTAMP NOT NULL
            )
        """)
        cursor.execute("CREATE INDEX idx_client_dprs_client_id ON client_dprs(client_id)")
        print("✓ client_dprs")

        conn.commit()
        print("\n✅ Database reset complete! All tables created fresh.")

    except Exception as e:
        conn.rollback()
        print(f"\n❌ Error: {e}")
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    confirm = input("WARNING: This will DELETE ALL DATA in Neon DB. Type 'yes' to confirm: ")
    if confirm.strip().lower() == 'yes':
        reset_db()
    else:
        print("Aborted.")
