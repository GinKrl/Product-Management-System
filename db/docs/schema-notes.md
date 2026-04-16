# Entity Relationship Diagram (ERD) Notes

## 📌 Overview
This ERD represents the database schema for a system covering HR management, sales transactions, product management, and user access control.

---

## 🗂️ Tables and Descriptions

### 👥 HR Module
* **`employee`** — Stores employee personal information (name, gender, birthdate, hire date, separation date).
* **`department`** — Contains department codes and names.
* **`job`** — Holds job codes and descriptions.
* **`jobhistory`** — Tracks an employee's job history including job code, effectivity date, salary, and department assignment.

### 💰 Sales Module
* **`sales`** — Records sales transactions linked to a customer and employee.
* **`salesdetail`** — Itemized details of each sale, linked to a product.
* **`payment`** — Records payment information for a sales transaction.
* **`customer`** — Stores customer information including address and payment terms.

### 📦 Product Module
* **`product`** — Contains product codes, descriptions, and units.
* **`pricehist`** — Tracks price history per product over time.

### 🔐 User Access Control Module
* **`user`** — Stores system user accounts with type and status, linked to Supabase `auth.users`.
* **`module`** — Defines system modules available in the application.
* **`rights`** — Defines access rights/permissions.
* **`usermodule_rights`** — Junction table that assigns specific module rights to users.

---

## ✍️ Notation
This ERD uses **Crow's Foot Notation** where:
* **Single line** = One side (Primary Key)
* **Crow's foot** = Many side (Foreign Key)
