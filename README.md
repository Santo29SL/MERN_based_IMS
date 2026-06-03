Designed a secure inventory platform with JWT authentication, role-based access control, CRUD APIs, and Postman-tested REST services. Along with a simple and functional React frontend.

Core Features to Implemented
✅ Backend (Primary Focus)
- User registration & login APIs with password hashing and JWT authentication
- Role-based access (user vs admin)
- CRUD APIs for a secondary entity (e.g., tasks, notes, or products)
- API versioning, error handling, validation
- API documentation (Postman)
- Database schema (MongoDB)

✅ Basic Frontend (Supportive)
Built with React.js 
Simple UI to:
- Register & log in users
- Access protected dashboard (JWT required)
- Perform CRUD actions on the entity
- Show error/success messages from API responses
  
✅ Security & Scalability
- Secure JWT token handling
- Input sanitization & validation
- Scalable project structure for new modules

Workflow -- IMS
- 4 types of role based entry supported
1. Admin
   - Add/update/delete stocks according to stock levels ie. if(low<5) Restock
   - View Orders placed and manage packing deliverables
   - manage overall working of the system

2. User/Customer
  - Browse though available products and shop by placing order
  - view delievry timeline

3. Warehouse Worker
   - Deliver stock and add into inventory if restock requested by admin
   - update stock values as per request
  
4. Delivery Partner
   - Deliver packed goods as the timeline from inventory to the customer
