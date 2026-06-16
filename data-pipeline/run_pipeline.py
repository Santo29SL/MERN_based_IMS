import os
import sys
import time

# Ensure we can import modules from the local data-pipeline folder
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(SCRIPT_DIR)

try:
    from ingest import ingest_collections
    from process import process_data
except ImportError as e:
    print(f"❌ Integration Error: Make sure ingest.py and process.py exist. Detail: {e}")
    sys.exit(1)

def run_orchestrator():
    print("=" * 60)
    print("🚀 STARTING MEDALLION DATA PIPELINE (MongoDB -> CSV -> Tableau) 🚀")
    print("=" * 60)
    
    start_time = time.time()
    
    # --- STEP 1: BRONZE LAYER (INGESTION) ---
    print("\n📥 [STEP 1/2] BRONZE LAYER: INGESTING RAW DATA")
    print("-" * 50)
    try:
        ingest_collections()
    except Exception as e:
        print(f"❌ Ingestion phase failed: {e}")
        sys.exit(1)
        
    # --- STEP 2: SILVER & GOLD LAYER (PROCESSING) ---
    print("\n⚙️ [STEP 2/2] SILVER & GOLD LAYER: TRANSFORMING & AGGREGATING")
    print("-" * 50)
    try:
        process_data()
    except Exception as e:
        print(f"❌ Processing phase failed: {e}")
        sys.exit(1)
        
    elapsed_time = time.time() - start_time
    
    print("\n" + "=" * 60)
    print(f"✅ PIPELINE EXECUTED SUCCESSFULLY IN {elapsed_time:.2f} SECONDS!")
    print("📂 Processed data located in: data-pipeline/data/processed/")
    print("=" * 60)

if __name__ == "__main__":
    run_orchestrator()
