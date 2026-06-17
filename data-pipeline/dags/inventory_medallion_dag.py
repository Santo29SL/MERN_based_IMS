from datetime import datetime, timedelta
import os
from airflow import DAG
from airflow.operators.bash import BashOperator

# Define paths dynamically depending on running environment (Docker vs Local)
if os.getenv("DOCKER_ENV") == "true":
    PROJECT_DIR = "/opt/airflow/data-pipeline"
    PYTHON_BIN = "python"
    DBT_BIN = "dbt"
    INGEST_SCRIPT = os.path.join(PROJECT_DIR, "ingest_to_postgres.py")
    DBT_PROJECT_DIR = os.path.join(PROJECT_DIR, "dbt_project")
else:
    PROJECT_DIR = "/Users/santhoshsl/Desktop/inventory-management-system"
    PYTHON_BIN = os.path.join(PROJECT_DIR, "venv", "bin", "python")
    DBT_BIN = os.path.join(PROJECT_DIR, "venv", "bin", "dbt")
    INGEST_SCRIPT = os.path.join(PROJECT_DIR, "data-pipeline", "ingest_to_postgres.py")
    DBT_PROJECT_DIR = os.path.join(PROJECT_DIR, "data-pipeline", "dbt_project")


# Default arguments for the Airflow DAG
default_args = {
    "owner": "inventory_admin",
    "depends_on_past": False,
    "email_on_failure": False,
    "email_on_retry": False,
    "retries": 1,
    "retry_delay": timedelta(minutes=5),
}

# Define the DAG
with DAG(
    "inventory_postgres_medallion_pipeline",
    default_args=default_args,
    description="Orchestrates MongoDB -> PostgreSQL (Bronze) -> dbt (Silver & Gold) Pipeline",
    schedule_interval=timedelta(days=1),  # Run daily
    start_date=datetime(2026, 6, 1),
    catchup=False,
    tags=["inventory", "postgres", "dbt", "airflow"],
) as dag:

    # 1. Bronze Task: Extract raw data from MongoDB and load it into PostgreSQL
    ingest_bronze = BashOperator(
        task_id="ingest_mongodb_to_postgres_bronze",
        bash_command=f"{PYTHON_BIN} {INGEST_SCRIPT}",
        cwd=PROJECT_DIR,
    )

    # 2. Silver Task: Run dbt transformation for conformed staging models
    dbt_silver = BashOperator(
        task_id="dbt_run_silver_conformed",
        bash_command=f"{DBT_BIN} run --select tag:silver --profiles-dir .",
        cwd=DBT_PROJECT_DIR,
    )

    # 3. Gold Task: Run dbt transformation for analytical KPI aggregates
    dbt_gold = BashOperator(
        task_id="dbt_run_gold_aggregates",
        bash_command=f"{DBT_BIN} run --select tag:gold --profiles-dir .",
        cwd=DBT_PROJECT_DIR,
    )

    # Define execution sequence
    ingest_bronze >> dbt_silver >> dbt_gold
