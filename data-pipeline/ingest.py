import os
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv

# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Load connection string from the backend's .env file (resolved absolute path)
dotenv_path = os.path.join(SCRIPT_DIR, "../backend/.env")
load_dotenv(dotenv_path=dotenv_path)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/slinventoryDB")
# Resolve output directory to data-pipeline/data/raw
RAW_DATA_DIR = os.path.join(SCRIPT_DIR, "data", "raw")

def connect_to_db():
    """Establishes connection to MongoDB."""
    print("Connecting to MongoDB...")
    client = MongoClient(MONGO_URI)
    # Extract DB name from URI
    db_name = MONGO_URI.split("/")[-1].split("?")[0]
    return client[db_name]

def clean_dataframe(df):
    """Cleans MongoDB specific fields (like ObjectId) into standard strings."""
    if df.empty:
        return df
    
    # Convert MongoDB _id to string
    if '_id' in df.columns:
        df['_id'] = df['_id'].astype(str)
        
    # Convert any references/ObjectIds to string
    for col in df.columns:
        # Check if column is object type (which ObjectIds are loaded as)
        if df[col].dtype == 'object':
            df[col] = df[col].apply(lambda x: str(x) if x is not None else None)
            
    return df

def ingest_collections():
    """Extracts data from MongoDB and saves as CSV."""
    db = connect_to_db()
    
    # Ensure landing directory exists
    os.makedirs(RAW_DATA_DIR, exist_ok=True)
    
    # List of collections we want to ingest
    collections = ["users", "products", "orders", "stocklogs", "restocks"]
    
    for coll_name in collections:
        print(f"Ingesting collection: '{coll_name}'...")
        collection = db[coll_name]
        
        # Extract all documents
        cursor = collection.find({})
        df = pd.DataFrame(list(cursor))
        
        if df.empty:
            print(f"Warning: Collection '{coll_name}' is empty.")
            continue
            
        # Clean ObjectID references
        df = clean_dataframe(df)
        
        # Save to raw landing folder
        output_path = os.path.join(RAW_DATA_DIR, f"raw_{coll_name}.csv")
        df.to_csv(output_path, index=False)
        print(f"Successfully saved {len(df)} records to {output_path}")

if __name__ == "__main__":
    try:
        ingest_collections()
        print("Data Ingestion Pipeline Completed Successfully!")
    except Exception as e:
        print(f"Ingestion failed: {e}")
