import os
import pandas as pd
from pymongo import MongoClient
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Load connection string from the backend's .env file
dotenv_path = os.path.join(SCRIPT_DIR, "../backend/.env")
load_dotenv(dotenv_path=dotenv_path)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/slinventoryDB")
POSTGRES_URI = os.getenv("POSTGRES_URI", "postgresql://postgres:postgres@localhost:5432/slinventoryDB")

# Override hosts for Docker container environment
if os.getenv("DOCKER_ENV") == "true":
    MONGO_URI = MONGO_URI.replace("localhost", "host.docker.internal")
    POSTGRES_URI = POSTGRES_URI.replace("localhost", "host.docker.internal")


def clean_dataframe(df):
    """Cleans MongoDB specific fields (like ObjectId) into standard strings."""
    if df.empty:
        return df
    
    # Convert MongoDB _id to string
    if '_id' in df.columns:
        df['_id'] = df['_id'].astype(str)
        
    # Convert any references/ObjectIds/objects to string for relational database compatibility
    for col in df.columns:
        if df[col].dtype == 'object':
            df[col] = df[col].apply(lambda x: str(x) if x is not None and not pd.isna(x) else None)
            
    return df

def ingest_to_postgres():
    print("🔌 Connecting to MongoDB & PostgreSQL...")
    # MongoDB Connection
    mongo_client = MongoClient(MONGO_URI)
    mongo_db_name = MONGO_URI.split("/")[-1].split("?")[0]
    if not mongo_db_name or mongo_db_name == MONGO_URI:
        mongo_db_name = "slinventoryDB"
    mongo_db = mongo_client[mongo_db_name]
    
    # PostgreSQL Connection
    pg_engine = create_engine(POSTGRES_URI)
    
    collections = ["users", "products", "orders", "stocklogs", "restocks"]
    
    # Run the ETL
    with pg_engine.connect() as pg_conn:
        for coll_name in collections:
            print(f"📥 Extracting '{coll_name}' from MongoDB...")
            collection = mongo_db[coll_name]
            cursor = collection.find({})
            df = pd.DataFrame(list(cursor))
            
            if df.empty:
                print(f"⚠️ Warning: Collection '{coll_name}' is empty. Skipping.")
                continue
                
            # Clean BSON types for SQL compatibility
            df = clean_dataframe(df)
            
            # Convert all column names to lowercase for PostgreSQL compatibility
            df.columns = [col.lower() for col in df.columns]
            
            # Load to postgres
            print(f"📤 Loading '{coll_name}' into postgres: bronze.{coll_name}...")
            
            # Truncate existing staging table first
            pg_conn.execute(text(f"TRUNCATE TABLE bronze.{coll_name} CASCADE"))
            pg_conn.commit()
            
            # Load to postgres
            df.to_sql(
                name=coll_name,
                con=pg_engine,
                schema="bronze",
                if_exists="append",
                index=False
            )
            print(f"✅ Successfully loaded {len(df)} records into bronze.{coll_name}")
            
    print("🏁 Bronze ingestion to PostgreSQL completed successfully!")

if __name__ == "__main__":
    try:
        ingest_to_postgres()
    except Exception as e:
        print(f"❌ Ingestion failed: {e}")
