from app.database import engine
from sqlalchemy import text

def migrate():
    print("Migrating database...")
    with engine.connect() as conn:
        try:
            # Check if column exists
            result = conn.execute(text("SHOW COLUMNS FROM mappings LIKE 'status'"))
            if result.fetchone():
                print("Column 'status' already exists.")
            else:
                print("Adding 'status' column...")
                conn.execute(text("ALTER TABLE mappings ADD COLUMN status VARCHAR(50) DEFAULT 'official'"))
                # Set existing records to official
                conn.execute(text("UPDATE mappings SET status = 'official' WHERE status IS NULL"))
                conn.commit()
                print("Migration successful.")
        except Exception as e:
            print(f"Migration failed: {e}")
            # Fallback for SQLite (if environment differs, but user said 'mysql' in prompt)
            # If using sqlite, ALTER TABLE ADD COLUMN is supported but syntax different? 
            # Standard SQL supports ADD COLUMN.
            # But "SHOW COLUMNS" is MySQL specific.
            # If SQLite: PRAGMA table_info(mappings)
            try:
                # SQLite fallback check
                if 'sqlite' in str(engine.url):
                    print("Detected SQLite, attempting fallback check...")
                    result = conn.execute(text("PRAGMA table_info(mappings)")).fetchall()
                    has_status = any(row[1] == 'status' for row in result)
                    if not has_status:
                        conn.execute(text("ALTER TABLE mappings ADD COLUMN status VARCHAR(50) DEFAULT 'official'"))
                        conn.commit()
                        print("SQLite Migration successful.")
                    else:
                        print("SQLite: status column exists.")
            except Exception as e2:
                 print(f"Fallback failed: {e2}")

if __name__ == "__main__":
    migrate()
