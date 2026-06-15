import os
import pandas as pd

# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

RAW_DATA_DIR = os.path.join(SCRIPT_DIR, "data", "raw")
PROCESSED_DATA_DIR = os.path.join(SCRIPT_DIR, "data", "processed")

def process_data():
    print("Starting Data Processing Phase...")
    
    # Ensure processed directory exists
    os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
    
    # Define file paths
    orders_path = os.path.join(RAW_DATA_DIR, "raw_orders.csv")
    products_path = os.path.join(RAW_DATA_DIR, "raw_products.csv")
    users_path = os.path.join(RAW_DATA_DIR, "raw_users.csv")
    
    # Check if raw files exist
    if not (os.path.exists(orders_path) and os.path.exists(products_path) and os.path.exists(users_path)):
        print("Error: Missing raw CSV files in data/raw/. Please run ingest.py first.")
        return
        
    # Load Raw Data
    df_orders = pd.read_csv(orders_path)
    df_products = pd.read_csv(products_path)
    df_users = pd.read_csv(users_path)
    
    # Ensure ID columns are strings
    df_orders['product'] = df_orders['product'].astype(str)
    df_orders['customer'] = df_orders['customer'].astype(str)
    df_products['_id'] = df_products['_id'].astype(str)
    df_users['_id'] = df_users['_id'].astype(str)
    
    # ====================================================
    # 1. ANALYSIS: Most Ordered Items
    # ====================================================
    print("Processing: Most Ordered Items...")
    df_top_items = df_orders.groupby('product').agg(
        total_quantity_sold=('quantity', 'sum'),
        total_orders=('quantity', 'count'),
        total_revenue=('totalPrice', 'sum')
    ).reset_index()
    
    # Merge with products to get product names
    df_top_items = pd.merge(df_top_items, df_products, left_on='product', right_on='_id', how='inner')
    df_top_items = df_top_items[['productName', 'category', 'total_quantity_sold', 'total_orders', 'total_revenue']]
    df_top_items = df_top_items.sort_values(by='total_quantity_sold', ascending=False)
    
    top_items_output = os.path.join(PROCESSED_DATA_DIR, "most_ordered_items.csv")
    df_top_items.to_csv(top_items_output, index=False)
    print(f"Saved: {top_items_output}")
    
    # ====================================================
    # 2. ANALYSIS: Customer Cart / Order Values (Avg, Min, Max)
    # ====================================================
    print("Processing: Customer Order Value Metrics...")
    df_customer_orders = df_orders.groupby('customer').agg(
        avg_order_value=('totalPrice', 'mean'),
        min_order_value=('totalPrice', 'min'),
        max_order_value=('totalPrice', 'max'),
        total_orders_placed=('totalPrice', 'count'),
        total_amount_spent=('totalPrice', 'sum')
    ).reset_index()
    
    # Merge with users to get customer names (filtering for customer role users)
    df_customer_orders = pd.merge(df_customer_orders, df_users, left_on='customer', right_on='_id', how='inner')
    df_customer_orders = df_customer_orders[['name', 'email', 'avg_order_value', 'min_order_value', 'max_order_value', 'total_orders_placed', 'total_amount_spent']]
    
    customer_orders_output = os.path.join(PROCESSED_DATA_DIR, "customer_order_metrics.csv")
    df_customer_orders.to_csv(customer_orders_output, index=False)
    print(f"Saved: {customer_orders_output}")
    
    # ====================================================
    # 3. ANALYSIS: Repeat Customer Retention Split
    # ====================================================
    print("Processing: Customer Retention Split...")
    # Add classification of customer type
    df_customer_orders['customer_type'] = df_customer_orders['total_orders_placed'].apply(
        lambda x: "Repeat Customer" if x > 1 else "Single-Order Customer"
    )
    
    # Summarize retention counts
    df_retention = df_customer_orders.groupby('customer_type').size().reset_index(name='customer_count')
    df_retention['percentage'] = (df_retention['customer_count'] / df_retention['customer_count'].sum() * 100).round(2)
    
    retention_output = os.path.join(PROCESSED_DATA_DIR, "customer_retention.csv")
    df_retention.to_csv(retention_output, index=False)
    print(f"Saved: {retention_output}")
    
    print("Data Processing Phase Completed Successfully!")

if __name__ == "__main__":
    process_data()
