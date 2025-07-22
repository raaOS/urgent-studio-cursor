# Entity Relationship Diagram (ERD) - Urgent Studio

## Entitas dan Relasi

```
+----------------+       +----------------+       +----------------+
|     Users      |       |    Projects    |       |    Services    |
+----------------+       +----------------+       +----------------+
| id (PK)        |       | id (PK)        |       | id (PK)        |
| email          |       | title          |       | name           |
| password_hash  |       | description    |       | description    |
| full_name      |       | client_id (FK) |       | price          |
| role           |       | status         |       | duration_hours |
| created_at     |       | created_at     |       | created_at     |
| updated_at     |       | updated_at     |       | updated_at     |
+----------------+       +----------------+       +----------------+
        |                        |                        |
        |                        |                        |
        +------------+-----------+                        |
                     |                                    |
                     v                                    |
              +----------------+                          |
              |    Bookings    |                          |
              +----------------+                          |
              | id (PK)        |                          |
              | user_id (FK)   |<-------------------------+
              | service_id (FK)|                           
              | project_id (FK)|                           
              | booking_date   |                           
              | status         |                           
              | notes          |                           
              | created_at     |                           
              | updated_at     |                           
              +----------------+                           
```

## Deskripsi Entitas

### Users
- Menyimpan informasi pengguna sistem
- Memiliki peran berbeda: admin, designer, client
- Primary Key: id (UUID)

### Projects
- Menyimpan informasi proyek desain
- Terhubung ke client melalui client_id
- Primary Key: id (UUID)
- Foreign Key: client_id → Users.id

### Services
- Menyimpan informasi layanan yang ditawarkan
- Mencakup harga dan durasi estimasi
- Primary Key: id (UUID)

### Bookings
- Menyimpan informasi pemesanan layanan
- Menghubungkan Users, Services, dan Projects
- Primary Key: id (UUID)
- Foreign Keys:
  - user_id → Users.id
  - service_id → Services.id
  - project_id → Projects.id

## Relasi

1. **User - Project**: One-to-Many
   - Satu user (client) dapat memiliki banyak project
   - Setiap project dimiliki oleh satu client

2. **User - Booking**: One-to-Many
   - Satu user dapat membuat banyak booking
   - Setiap booking dibuat oleh satu user

3. **Service - Booking**: One-to-Many
   - Satu service dapat dipesan dalam banyak booking
   - Setiap booking terkait dengan satu service

4. **Project - Booking**: One-to-Many
   - Satu project dapat memiliki banyak booking
   - Setiap booking terkait dengan satu project