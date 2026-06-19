# 📦 Role-Based Inventory Management System (IMS)

A secure, role-based inventory management platform designed to handle active workflows for inventory logs, restock events, and customer order management. The project is split into two core sections:
1.  **Core Web Application:** React.js frontend and Node.js/Express.js backend utilizing JWT authentication and Role-Based Access Control (RBAC).
2.  **Modern Data Stack (MDS) Pipeline:** Automated data warehousing using MongoDB, PostgreSQL, dbt (Data Build Tool), Apache Airflow, and Apache Superset.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React.js, Vite, Axios, CSS3 |
| **Backend** | Node.js, Express.js, JWT (JSON Web Tokens), bcrypt.js |
| **Database (OLTP)** | MongoDB (Operational database for website transactions) |
| **Warehouse (OLAP)**| PostgreSQL (Analytical storage divided into Bronze, Silver, Gold schemas) |
| **Orchestration** | Apache Airflow (Docker-based pipeline scheduling) |
| **Transformations** | dbt (Data Build Tool for database conformed modeling) |
| **Visualization** | Apache Superset (Analytics dashboards) |

---

## 🔑 Key Features (1st Part: Web Application)

### 🔐 Secure Authentication & Access Control
*   **Password Hashing:** Implements one-way `bcrypt` password hashing on user registration to secure credentials.
*   **Token Authorization:** Issues secure JSON Web Tokens (JWT) upon login, required to access protected routes and endpoints.
*   **Input Validation:** Robust server-side validation and sanitization of incoming requests to prevent injection vulnerabilities.

### 🛡️ Role-Based Access Control (RBAC)
The platform features **four distinct user roles** with customized dashboard workflows and restricted API access:

| Role | Access Level | Core Responsibilities |
| :--- | :--- | :--- |
| 👑 **Admin** | Read, Write, Delete | Add, edit, and delete products; request restocks when quantities drop below critical thresholds (`quantity < 5`); manage deliverables and oversee system security. |
| 👤 **User/Customer** | Read, Write (Orders) | Browse the product catalog, place purchase orders, and track delivery timelines. |
| 🛠️ **Warehouse Worker** | Read, Write (Inventory) | Update inventory logs, handle inbound shipments, and insert stocks requested by admins. |
| 🚚 **Delivery Partner** | Read, Write (Logistics) | Fulfill shipments, update dispatch logs, and transition order statuses to "delivered". |

---

## ⚙️ Data Engineering Pipeline (2nd Part: Analytics)  (((NOTEE:: DE PIPELINE ONLY WORKS WITH LOCAL DATABASE FOR NOW)))

The project incorporates a complete **Medallion Data Pipeline** to transform transactional database records into clean analytical datasets:

1.  **Ingestion (Bronze Schema):** Extracts raw MongoDB collections and loads them into PostgreSQL raw staging tables using Python ([ingest_to_postgres.py](data-pipeline/ingest_to_postgres.py)).
2.  **Transformation (Silver Schema):** Standardizes types, formats timestamps, and coalesces historical schema versions (such as linking customer/product references) using **dbt conformed models**.
3.  **Aggregation (Gold Schema):** Compiles high-performance analytical views (sales rankings, customer lifespans, and retention distributions) via **dbt analytical models**.
4.  **Orchestrator:** **Apache Airflow** DAGs managing the automated scheduling of ingestion and transformation.
5.  **BI Layer:** **Apache Superset** dashboards querying the PostgreSQL `gold` schema tables.

*For detailed instructions on running the data pipeline, see the [Data Pipeline README](data-pipeline/README.md).*

---

## 🚀 Local Quickstart Guide

### 1. Start the Backend API
```bash
cd backend
npm install
npm start
```
*(Configure your connection strings in the `backend/.env` file).*

### 2. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Spin Up the Data Infrastructure (Docker)
Ensure Docker Desktop is active and run:
```bash
docker compose up -d
```
*   **Airflow Console:** [http://localhost:8085](http://localhost:8085)
*   **Superset Console:** [http://localhost:8088](http://localhost:8088)

---

<img width="1710" height="1112" alt="image" src="https://github.com/user-attachments/assets/829d630c-8004-49f1-98c7-2102b4e07b9b" />

