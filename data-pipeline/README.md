# Medallion Data Pipeline (MongoDB -> PostgreSQL -> dbt -> Airflow -> Superset)

This directory contains the Python & SQL files for the Modern Data Stack (MDS) Medallion Architecture data engineering pipeline that extracts raw data from your operational MongoDB database, loads it into a PostgreSQL data warehouse, transforms it across schemas using dbt, and visualizes it inside Apache Superset.

---

## 📐 Pipeline Architecture

```mermaid
graph TD
    A[MongoDB Local] -->|ingest_to_postgres.py| B[(PostgreSQL DB: slinventoryDB)]
    
    subgraph PostgreSQL Data Warehouse
        B -->|Staging Stored| C(Bronze Schema: Raw Staging)
        C -->|dbt run --select tag:silver| D(Silver Schema: Cleaned & Conformed)
        D -->|dbt run --select tag:gold| E(Gold Schema: Analytical KPIs)
    end
    
    subgraph Orchestration
        F(Apache Airflow DAG) -->|1. Run Ingestion| B
        F -->|2. Run dbt Staging| D
        F -->|3. Run dbt Aggregates| E
    end
    
    E -->|Direct Query| G[Apache Superset Dashboard]

    style A fill:#4CAF50,stroke:#388E3C,color:#fff
    style B fill:#3F51B5,stroke:#303F9F,color:#fff
    style C fill:#795548,stroke:#5D4037,color:#fff
    style D fill:#9E9E9E,stroke:#616161,color:#fff
    style E fill:#FFEB3B,stroke:#FBC02D,color:#000
    style F fill:#009688,stroke:#00796B,color:#fff
    style G fill:#E91E63,stroke:#C2185B,color:#fff
```

---

## 🗂️ Medallion Architecture Layers

### 🟫 1. Bronze Layer (Raw Ingest)
*   **Description**: Raw, unmodified staging tables loaded from MongoDB.
*   **Ingestion Tool**: [ingest_to_postgres.py](ingest_to_postgres.py) (uses `pymongo` and `sqlalchemy` to fetch collections, sanitize ObjectIDs, and load tables under the `bronze` schema).
*   **Schema Init Script**: [postgres_init.sql](postgres_init.sql)

### ⬜ 2. Silver Layer (Cleaned & Conformed)
*   **Description**: Cleaned staging tables representing aligned data types, conformed schema variations, and formatted timestamps.
*   **Transformation Tool**: `dbt run --select tag:silver` (executes SQL models under `/dbt_project/models/silver/`):
    *   `stg_users`: Typecasts timestamps.
    *   `stg_products`: Standardizes columns and types.
    *   `stg_orders`: Coalesces historical schema shifts (e.g. `customerId`/`customer` and `totalAmount`/`totalPrice`).
    *   `stg_stocklogs` & `stg_restocks`: Standardizes logs and stock counts.

### 🟨 3. Gold Layer (Analytics & Aggregated)
*   **Description**: Business-level metrics and KPI tables optimized for reporting queries.
*   **Transformation Tool**: `dbt run --select tag:gold` (executes SQL models under `/dbt_project/models/gold/`):
    *   `most_ordered_items`: Aggregates units sold, total order counts, and cumulative revenue.
    *   `customer_order_metrics`: Aggregates order averages, minimums, maximums, and total lifetime spend.
    *   `customer_retention`: Computes Repeat vs Single-Order customer counts and percentage distributions.

---

## 🚀 How to Setup and Run the Pipeline

### Step 1: Start Airflow & Superset (Docker)
Ensure Docker Desktop is active on your Mac and run:
```bash
docker compose up -d
```
*   **Airflow Web UI**: [http://localhost:8085](http://localhost:8085) (Credentials: `airflow` / `airflow`)
*   **Superset BI UI**: [http://localhost:8088](http://localhost:8088) (Credentials: `admin` / `admin` or `santhosh` / `santhosh`)

### Step 2: Initialize PostgreSQL Schemas
Initialize the Medallion schemas and tables on your local PostgreSQL database:
```bash
psql -U postgres -d slinventoryDB -f data-pipeline/postgres_init.sql
```

### Step 3: Run Ingestion and Transformations
You can trigger this pipeline either through the Airflow DAG (`inventory_postgres_medallion_pipeline`) or manually in your terminal:

```bash
# 1. Run Python Raw Ingestion
python data-pipeline/ingest_to_postgres.py

# 2. Run dbt transformations (from the dbt_project folder)
cd data-pipeline/dbt_project
dbt run --profiles-dir .
```

---

## 📈 Visualizing Pipelines and Data Lineage

### 1. View Lineage Flowchart (dbt Docs)
To see how tables relate and transform, run inside `data-pipeline/dbt_project/`:
```bash
dbt docs generate --profiles-dir .
dbt docs serve --profiles-dir .
```
Open [http://localhost:8000](http://localhost:8000) and click the **teal circle icon** in the bottom-right corner.

### 2. View Execution Pipeline (Airflow)
Go to [http://localhost:8085](http://localhost:8085) and click on **`inventory_postgres_medallion_pipeline`** to view the task graph.

### 3. Connect Superset to PostgreSQL
1. Open Superset at [http://localhost:8088](http://localhost:8088).
2. Go to **Settings** -> **Database Connections** -> **+ Database** -> **PostgreSQL**.
3. Connection URI:
   `postgresql://postgres:postgres@host.docker.internal:5432/slinventoryDB`
4. Under **Datasets**, import datasets from the `gold` schema (`most_ordered_items`, `customer_order_metrics`, `customer_retention`).

<img width="1710" height="1112" alt="image" src="https://github.com/user-attachments/assets/ee222154-41c4-47ba-8684-8205b6274d6e" />


