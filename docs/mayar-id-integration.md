# Mayar Headless API - Complete Documentation

## Base Configuration

### Base URL
- **Production**: `https://api.mayar.id/hl/v1`
- **Sandbox**: `https://api.mayar.club/hl/v1`

### Authentication
```
Authorization: Bearer [Your-API-Key]
```

### Rate Limit
20 requests per minute

### Status Codes
- **200** - Request berhasil
- **400** - Bad request
- **401** - Unauthorized
- **404** - Not found
- **429** - Rate limit exceeded
- **500** - Server error

---

# 1. Product

## Overview
Product Management API memungkinkan Anda mengelola produk dalam sistem Mayar.

## Product Types
- `generic_link`, `physical_product`, `event`, `webinar`, `digital_product`
- `coaching`, `cohort_based`, `fundraising`, `ebook`, `podcast`
- `audiobook`, `membership`

## Product Status
- `active` - Produk aktif
- `closed` - Produk ditutup

## Endpoints

### GET All Products
```
GET /product?page=1&pageSize=10
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Nomor halaman |
| `pageSize` | integer | Jumlah item per halaman |

**Response:**
```json
{
  "statusCode": 200,
  "messages": "success",
  "hasMore": true,
  "pageCount": 23,
  "pageSize": 10,
  "page": 1,
  "data": [
    {
      "id": "00f78890-dda0-4e91-b898-820ee1d05292",
      "name": "Product Name",
      "type": "webinar",
      "status": "active"
    }
  ]
}
```

### GET Products by Type
```
GET /product/type/{type}?page=1&pageSize=100
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
```

**Path Parameters:**
- `type` - Tipe produk (lihat Product Types)

**Response:**
```json
{
  "statusCode": 200,
  "messages": "success",
  "hasMore": false,
  "pageCount": 1,
  "pageSize": 10,
  "page": 1,
  "data": [
    {
      "id": "1b1d1b49-9cd0-40b8-9e47-ff54d32d151e",
      "amount": null,
      "type": "event"
    }
  ]
}
```

### GET Search Product
```
GET /product?search={keyword}
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Kata kunci pencarian |

**Response:**
```json
{
  "statusCode": 200,
  "messages": "success",
  "hasMore": false,
  "pageCount": 0,
  "pageSize": 10,
  "page": 1,
  "data": []
}
```

### GET Product Detail
```
GET /product/{productId}
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
```

**Response:**
```json
{
  "statusCode": 200,
  "messages": "success",
  "data": {
    "id": "00a1cd6a-0a30-4746-bd30-06d2f619041e",
    "link": "microsoft",
    "name": "Microsoft",
    "category": null,
    "limit": 10,
    "type": "webinar",
    "userId": "463a9515-95d7-4bbb-945c-b1285019c019"
  }
}
```

### GET Close Product
```
GET /product/close/{productId}
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
```

**Response Success:**
```json
{
  "statusCode": 200,
  "messages": "success"
}
```

**Response Failed:**
```json
{
  "statusCode": 200,
  "messages": "failed"
}
```

### GET Re-open Product
```
GET /product/open/{productId}
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
```

**Response Success:**
```json
{
  "statusCode": 200,
  "messages": "success"
}
```

---

# 2. Invoice

## Overview
Invoice API memungkinkan Anda membuat, mengedit, dan mengelola invoice.

## Endpoints

### POST Create Invoice
```
POST /invoice/create
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
Content-Type: application/json
```

**Body:**
```json
{
  "name": "andre",
  "email": "alikusnadie@gmail.com",
  "mobile": "085797522261",
  "redirectUrl": "https://kelaskami.com/nexst23",
  "description": "pembelian es kopis usu botol",
  "expiredAt": "2024-02-29T09:41:09.401Z",
  "items": [{
    "quantity": 2,
    "rate": 55000,
    "description": "es kopi susu botol"
  }]
}
```

**Response:**
```json
{
  "statusCode": 200,
  "messages": "success",
  "data": {
    "id": "bdf9d972-811f-4472-8fdc-2baae04b5148",
    "transactionId": "bdf9d972-811f-4472-8fdc-2baae04b5148",
    "link": "https://donasi.sekuts.com/invoices/null"
  }
}
```

### POST Edit Invoice
```
POST /invoice/edit
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
Content-Type: application/json
```

**Body:**
```json
{
  "id": "bdf9d972-811f-4472-8fdc-2baae04b5148",
  "redirectUrl": "https://kelaskami.com/nexst23",
  "description": "kemana ini menjadi a",
  "items": [{
    "quantity": 2,
    "rate": 55000,
    "description": "ayam jago"
  }]
}
```

**Response:**
```json
{
  "statusCode": 200,
  "messages": "success",
  "data": {
    "id": "85bedd25-b3c8-4804-81b3-286d44a829a6",
    "transactionId": "a557160b-a39d-492d-becc-5f0ec66088c7",
    "link": "https://cacana.mayar.link/invoices/qvrko39k2z"
  }
}
```

### GET All Invoices
```
GET /invoice
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
```

**Response:**
```json
{
  "statusCode": 200,
  "messages": "success",
  "hasMore": false,
  "pageCount": 1,
  "pageSize": 10,
  "page": 1,
  "data": [
    {
      "id": "81d366ef-35fb-4784-bf2e-68ae46e6cc9a",
      "amount": 155000
    }
  ]
}
```

### GET Filter Invoice
```
GET /invoice?sort={status}
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
```

**Parameters:**
| Parameter | Type | Options |
|-----------|------|---------|
| `sort` | string | `active`, `paid`, `closed` |

### GET Invoice Detail
```
GET /invoice/{invoiceId}
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
```

**Response:**
```json
{
  "statusCode": 200,
  "messages": "success",
  "data": {
    "id": "de141021-d9d9-4cbd-b2da-7b13420d9164",
    "amount": 40000,
    "status": "created",
    "customerId": "f74aab9f-03a1-41f7-b256-7cbd45dd7278",
    "customer": {
      "id": "f74aab9f-03a1-41f7-b256-7cbd45dd7278",
      "email": "alikusnadie@gmail.com"
    }
  }
}
```

### GET Close Invoice
```
GET /invoice/close/{invoiceId}
```

### GET Re-open Invoice
```
GET /invoice/open/{invoiceId}
```

---

# 3. Request Payment

## Overview
Request Payment API untuk membuat dan mengelola permintaan pembayaran tunggal (penagihan).

## Endpoints

### POST Create Single Payment Request
```
POST /payment/create
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
Content-Type: application/json
```

**Body:**
```json
{
  "name": "andre",
  "email": "alikusnadie@gmail.com",
  "amount": 170000,
  "mobile": "085797522261",
  "redirectUrl": "https://kelaskami.com/nexst23",
  "description": "kemana ini menjadi a",
  "expiredAt": "2024-02-29T09:41:09.401Z"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "messages": "success",
  "data": {
    "id": "abadbafc-46c9-46ab-a6b4-c23dcffb8ffd",
    "transaction_id": "206d8f5e-0f9c-41aa-b424-377b463c7b67",
    "transactionId": "206d8f5e-0f9c-41aa-b424-377b463c7b67",
    "link": "https://cacana.mayar.link/invoices/f61oc2tz6j"
  }
}
```

**Check Status:**
```
GET /payment/{transaction_id}
```

### POST Edit Single Payment Request
```
POST /payment/edit
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Bayar ayam goreng 10 ss",
  "amount": 10000,
  "redirectUrl": "https://kelaskami.com/nexst23",
  "description": "coba dulu pak",
  "id": "00004e4c-26f7-4e5d-b35a-a4c87b40e324"
}
```

### GET All Payment Requests
```
GET /payment
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
```

### GET Filter Payment Requests
```
GET /payment?status={status}
```

**Parameters:**
| Parameter | Type | Options |
|-----------|------|---------|
| `status` | string | `active`, `paid`, `closed` |

### GET Payment Request Detail
```
GET /payment/{paymentId}
```

**Response:**
```json
{
  "statusCode": 200,
  "messages": "success",
  "data": {
    "id": "d2c36499-655b-41bb-b2b0-8e1f0505c1c3",
    "link": "eixikiurxq",
    "name": "Penagihan",
    "category": null,
    "limit": null,
    "type": "payment_request",
    "userId": "b83790ec-d8e0-4c92-9b6b-98a3f2fe4b94"
  }
}
```

### GET Close Payment Request
```
GET /payment/close/{paymentId}
```

### GET Re-open Payment Request
```
GET /payment/open/{paymentId}
```

---

# 4. Installment

## Overview
Installment API untuk membuat sistem cicilan.

## Endpoints

### POST Create Installment
```
POST /installment/create
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
Content-Type: application/json
```

**Required Fields:**
- `email`, `mobile`, `name`, `amount`, `installment`, `description`, `interest`, `dueDate`

**Body:**
```json
{
  "email": "alikusnadie@gmail.com",
  "mobile": "085797522261",
  "name": "andis",
  "amount": 1500000,
  "installment": {
    "description": "CICIL HP 3 bulan",
    "interest": 0,
    "tenure": 3,
    "dueDate": 11
  }
}
```

### GET Installment Detail
```
GET /installment/{installmentId}
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
```

---

# 5. Discount & Coupon

## Overview
Discount & Coupon API untuk membuat dan mengelola sistem diskon dan kupon.

## Endpoints

### POST Create Coupon
```
POST /coupon/create
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
Content-Type: application/json
```

**Fields:**
- `expiredAt` (optional) - ISO date string
- `name` (mandatory) - string
- `discount` (mandatory):
  - `discountType` - "monetary" atau "percentage"
  - `eligibleCustomerType` - "all", "new", "old"
  - `minimumPurchase` - integer
  - `value` - integer
  - `totalCoupons` - integer
- `coupon` (mandatory):
  - `code` (optional) - string
  - `type` - "onetime", "reusable"
- `products` (optional) - object untuk produk tertentu

**Body:**
```json
{
  "expiredAt": "2023-05-05T09:06:14.933Z",
  "name": "diskon ga berulang kali",
  "discount": {
    "discountType": "monetary",
    "eligibleCustomerType": "all",
    "minimumPurchase": 500000,
    "value": 100000,
    "totalCoupons": 100
  },
  "coupon": {
    "code": "DISKON100",
    "type": "onetime"
  }
}
```

### GET Coupon Detail
```
GET /coupon/{couponId}
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
```

---

# 6. Cart

## Overview
Cart API untuk mengelola keranjang belanja.

**⚠️ CATATAN: Fitur ini belum dirilis. Semua fitur cart hanya tersedia di rilis berikutnya!**

## Endpoints

### POST Add to Cart
```
POST /cart/add
```

**Body:**
```json
{
  "id": "4172192c-fdc8-43c6-ab86-8fc8b5f027c2",
  "sessionId": "session-events"
}
```

**Response Success:**
```json
{
  "statusCode": 200,
  "messages": "Success",
  "data": {
    "typeCart": "all",
    "userId": "b83790ec-d8e0-4c92-9b6b-98a3f2fe4b94",
    "sessionId": "session-events",
    "items": 1,
    "amountTotal": 12000,
    "productItems": []
  }
}
```

**Response Product Not Active:**
```json
{
  "statusCode": 400,
  "messages": "This product is no longer active.",
  "data": null
}
```

### POST Remove from Cart
```
POST /cart/remove
```

**Body:**
```json
{
  "id": "f444ca02-33a8-4cde-ade4-ae135feeab09",
  "sessionId": "session-event-2"
}
```

### POST Update Cart
```
POST /cart/update
```

**Body:**
```json
{
  "product": [
    {"id": "00f78890-dda0-4e91-b898-820ee1d05292"},
    {"id": "00004e4c-26f7-4e5d-b35a-a4c87b40e324"}
  ]
}
```

### GET Web Checkout Page
```
https://www.mayar.link/checkout/cart/{sessionId}
```

### POST Checkout
```
POST /checkout
```

**Payment Types:**
- **E-wallet**: `ewallet/OVO`, `ewallet/DANA`, `ewallet/LINKAJA`, `ewallet/JENIUSPAY`, `ewallet/GOPAY`
- **Virtual Account**: `va/BNI`, `va/BCA`, `va/MANDIRI`, `va/BRI`
- **QRIS**: `qris`
- **Paylater**: `akulaku`

**Body:**
```json
{
  "name": "andre",
  "email": "alikusnadie@gmail.com",
  "mobile": "085797522261",
  "redirectUrl": "https://kelaskami.com/nexst23",
  "description": "kemana ini menjadi a",
  "paymentType": "ewallet/OVO",
  "sessionId": "session-dimas-21"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "messages": "Success",
  "data": {
    "typeCart": "all",
    "xenditId": null,
    "link": "https://cacana.mayar.link/plt/231714dd-f05b-4d94-8102",
    "paymentType": "ewallet/OVO",
    "paymentLinkId": "df43bb61-c6b7-42e7-8a78-100638ff9c68",
    "transactionId": "231714dd-f05b-4d94-8102-ccdfd60f048a"
  }
}
```

### GET Cart
```
GET /cart
```

**Headers:**
```
Authorization: Bearer [Your-JWT]
```

### GET Cart with Custom Session
```
GET /cart?sessionId={sessionId}
```

---

# 7. Customer

## Overview
Customer API untuk mengelola data customer.

## Endpoints

### GET All Customers
```
GET /customer?page=1&pageSize=10
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Nomor halaman |
| `pageSize` | integer | Jumlah item per halaman |

**Response:**
```json
{
  "statusCode": 200,
  "messages": "success",
  "hasMore": false,
  "pageCount": 1,
  "pageSize": 10,
  "page": 1,
  "data": [
    {
      "id": "556ccecc-f030-4ea5-88f6-214fb682f4cb",
      "createdAt": 1672820678058
    }
  ]
}
```

### POST Create Magic Link
```
POST /customer/login/portal
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
Content-Type: application/json
```

**Body:**
```json
{
  "email": "alikusnadie@gmail.com"
}
```

### POST Update Customer
```
POST /customer/update
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
Content-Type: application/json
```

**Body:**
```json
{
  "fromEmail": "alikusnadie@gmail.com",
  "toEmail": "alikusnadie-baru@gmail.com"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "messages": "success",
  "data": {
    "fromEmail": "fromEmail@gmail.com",
    "toEmail": "toEmail@gmail.com",
    "userId": "b83790ec-d8e0-4c92-9b6b-98a3f2fe4b94"
  }
}
```

### POST Create Customer
```
POST /customer/create
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
Content-Type: application/json
```

**Body:**
```json
{
  "name": "alikusnadie 2025",
  "email": "alikusnadie@gmail.com",
  "mobile": "085797522261"
}
```

---

# 8. Transaction

## Overview
Transaction API untuk mengelola semua riwayat transaksi, detail transaksi, dan transaksi yang belum dibayar.

## Endpoints

### GET Account Balance
```
GET /balance
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
```

**Response:**
```json
{
  "statusCode": 200,
  "messages": "success",
  "data": {
    "balanceActive": 9831,
    "balancePending": 0,
    "balance": 9831
  }
}
```

### GET Paid Transactions
```
GET /transactions?page=1&pageSize=10
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Nomor halaman |
| `pageSize` | integer | Jumlah item per halaman |
| `startAt` | string | Tanggal mulai (ISO format) |
| `endAt` | string | Tanggal selesai (ISO format) |
| `status` | string | Status: `paid`, `settled` |
| `type` | string | Tipe transaksi |
| `customerId` | string | ID customer |
| `paymentLinkName` | string | Nama produk |
| `fields` | string | Field projection |

**Transaction Types:**
- `generic_link`, `payment_request`, `payme`, `invoice`, `bundling`
- `physical_product`, `event`, `webinar`, `digital_product`, `coaching`
- `course`, `cohort_based`, `fundraising`, `ebook`, `podcast`, `audiobook`, `membership`

**Response:**
```json
{
  "statusCode": 200,
  "messages": "success",
  "hasMore": false,
  "pageCount": 1,
  "pageSize": 10,
  "page": 1,
  "data": [
    {
      "id": "b3f03e9d-76b0-4bcd-8492-11927d99e38b",
      "credit": 10000
    }
  ]
}
```

### GET Unpaid Transactions
```
GET /transactions/unpaid?page=1&pageSize=10
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Nomor halaman |
| `pageSize` | integer | Jumlah item per halaman |
| `startAt` | string | Tanggal mulai (ISO format) |
| `endAt` | string | Tanggal selesai (ISO format) |
| `status` | string | Status: `active`, `expired` |
| `customerId` | string | ID customer |
| `paymentLinkName` | string | Nama produk |
| `fields` | string | Field projection |

**Response:**
```json
{
  "statusCode": 200,
  "messages": "success",
  "hasMore": true,
  "pageCount": 2,
  "pageSize": "10",
  "page": 1,
  "data": [
    {
      "id": "231ef362-24c2-4esbc-9efa-450c00e651e0",
      "createdAt": 1676272472384
    }
  ]
}
```

### POST Create Dynamic QRCode
```
POST /qrcode/create
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
Content-Type: application/json
```

**Body:**
```json
{
  "amount": 10000
}
```

### GET Static QRCode
```
GET /qrcode/static
```

**⚠️ Catatan: Hanya untuk user yang bergabung sebelum 8 Mei 2023**

**Headers:**
```
Authorization: Bearer [Your-API-Key]
```

**Response:**
```json
{
  "statusCode": 200,
  "messages": "Success",
  "data": {
    "url": "https://media.mayar.id/images/resized/480/248cfbef-3da"
  }
}
```

---

# 9. Webhook

## Overview
Webhook menyediakan notifikasi real-time ke external web server ketika event tertentu terjadi di Mayar.

## Setup Webhook
1. Buat akun di [https://mayar.id](https://mayar.id)
2. Pergi ke Integration -> Webhook
3. Input URL webhook Anda
4. Klik save dan test URL

## Event Types

| Event | Description |
|-------|-------------|
| `payment.received` | Setelah customer melakukan pembayaran |
| `payment.reminder` | Customer tidak menyelesaikan pembayaran setelah 29 menit |
| `shipper.status` | Tracking produk fisik berubah |
| `membership.memberUnsubscribed` | Member unsubscribe |
| `membership.memberExpired` | Member expired |
| `membership.changeTierMemberRegistered` | Member ganti tier |
| `membership.newMemberRegistered` | Member baru subscribe |

## Webhook Payloads

### payment.received
```json
{
  "event": "payment.received",
  "data": {
    "id": "9356ec92-32ae-4d99-a1a7-51b11dff4d84",
    "transactionId": "9356ec92-32ae-4d99-a1a7-51b11dff4d84",
    "status": "SUCCESS",
    "transactionStatus": "created",
    "createdAt": 1693817623264,
    "updatedAt": 1693817626638,
    "merchantId": "348e083d-315a-4e5c-96b1-5a2a98c48413",
    "merchantName": "Malo Gusto"
  }
}
```

### payment.reminder
```json
{
  "event": "payment.reminder",
  "data": {
    "id": "b147e908-bba4-4337-ab03-bf9be504a539",
    "status": "SUCCESS",
    "transactionStatus": "created",
    "createdAt": 1693550488964,
    "updatedAt": 1693550703627,
    "merchantId": "4dba4996-7d74-483e-99fe-b52c60368cb5",
    "merchantEmail": "kugutsu.hiruko@gmail.com",
    "customerName": "andre"
  }
}
```

### membership.memberUnsubscribed
```json
{
  "event": "membership.memberUnsubscribed",
  "data": {
    "merchantId": "4dba4996-7d74-483e-99fe-b52c60368cb5",
    "merchantName": "andrea",
    "status": "INACTIVE",
    "memberId": "BQ1UVCFB",
    "customerName": "andret",
    "customerEmail": "kugutsu.hiruko@gmail.com",
    "customerMobile": "085797522261"
  }
}
```

### membership.memberExpired
```json
{
  "event": "membership.memberExpired",
  "data": {
    "merchantId": "4dba4996-7d74-483e-99fe-b52c6873jrjb",
    "merchantName": "andrea",
    "status": "INACTIVE",
    "memberId": "5U2FV9PD",
    "customerName": "andika",
    "customerEmail": "alikusnadie@gmail.com",
    "customerMobile": "0815"
  }
}
```

### shipper.status
```json
{
  "event": "shipper.status",
  "data": {
    "id": "ebee706c-7216-48b1-a770-8971ca0c32bb",
    "status": "SUCCESS",
    "createdAt": "2023-09-05T05:17:05.964Z",
    "merchantId": "4dba4996-7d74-483e-99fe-b52c60368cb5",
    "merchantName": "andrea",
    "merchantEmail": "kugutsu.hiruko@gmail.com",
    "customerName": "andret",
    "customerEmail": "kugutsu.hiruko@gmail.com"
  }
}
```

### Custom Fields Example
```json
"custom_field": [
  {
    "name": "Nama klinik",
    "description": "",
    "fieldType": "text",
    "isRequired": true,
    "key": "10d8e7db-f015-4eec-a888-6483cc097f12",
    "type": "string",
    "value": "klink medika farma"
  }
]
```

## Webhook Management

### GET Webhook History
```
GET /webhook/history?page=1&pageSize=10
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Nomor halaman |
| `pageSize` | integer | Jumlah item per halaman |
| `startAt` | string | Tanggal mulai |
| `endAt` | string | Tanggal selesai |
| `status` | string | `SUCCESS`, `FAILED` |
| `type` | string | Tipe event |
| `urlDestination` | string | URL tujuan |

**Response:**
```json
{
  "statusCode": 200,
  "messages": "success",
  "hasMore": true,
  "pageCount": 30,
  "pageSize": 2,
  "page": 1,
  "data": [
    {
      "id": "45adfbd1-eefd-4f00-9a8a-1fe49119f4ec",
      "createdAt": 1707963554296
    }
  ]
}
```

### POST Register URL Hook
```
POST /webhook/register
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
Content-Type: application/json
```

**Body:**
```json
{
  "urlHook": "https://example.mayar.com"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "messages": "success"
}
```

### POST Test URL Hook
```
POST /webhook/test
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
Content-Type: application/json
```

**Body:**
```json
{
  "urlHook": "https://example.mayar.com"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "messages": "success"
}
```

### POST Retry History
```
POST /webhook/retry
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
Content-Type: application/json
```

**Body:**
```json
{
  "webhookHistoryId": "9f8050f0-9a58-4432-bf36-a7eeff7d6aea"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "messages": "success"
}
```

---

# 10. Software License Code

## Overview
Software License adalah fitur untuk menjual software dengan sistem lisensi. Mayar mengelola pembayaran, kode lisensi unik, verifikasi kode, dan masa aktif lisensi.

## Base URL
```
https://api.mayar.id/software/v1
```

## Endpoints

### POST Verify License
```
POST /license/verify
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
Content-Type: application/json
```

**Description:**
Endpoint untuk memverifikasi lisensi dengan menyediakan kode lisensi dan ID produk.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `licenseCode` | string | Yes | Kode lisensi yang akan diverifikasi |
| `productId` | string | Yes | ID produk yang terkait dengan lisensi |

**Body:**
```json
{
  "licenseCode": "YOUR-LICENSE-CODE",
  "productId": "YOUR-PRODUCT-ID"
}
```

**Response Success:**
```json
{
  "statusCode": 200,
  "isLicenseActive": true,
  "licenseCode": {
    "licenseCode": "LICENSECODE12345",
    "status": "ACTIVE",
    "expiredAt": "2025-12-12T19:46:24.000Z",
    "transactionId": "994d4071-a81e-4558-a854-47530eea9b6d",
    "productId": "84d1d247-a8b3-4c7d-96f0-cf276edb7c33",
    "customerId": "6a38cf26-6bab-42c8-92be-72f3a9fd4c33",
    "customerName": "John Doe"
  }
}
```

**Response Failed:**
```json
{
  "statusCode": 400,
  "message": "There's no license with code WRONGLICENSE123 and product"
}
```

---

# 11. SaaS Membership License

## Overview
SaaS Membership adalah fitur untuk menjual software dengan sistem subscription. Mayar mengelola pembayaran, kode lisensi unik, verifikasi, aktivasi, dan deaktivasi lisensi.

## Base URL
```
https://api.mayar.id/saas/v1
```

## Endpoints

### POST Verify License
```
POST /license/verify
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
Content-Type: application/json
```

**Description:**
Endpoint untuk memverifikasi lisensi dengan menyediakan kode lisensi dan ID produk.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `licenseCode` | string | Yes | Kode lisensi yang akan diverifikasi |
| `productId` | string | Yes | ID produk yang terkait dengan lisensi |

**Body:**
```json
{
  "licenseCode": "YOUR-LICENSE-CODE",
  "productId": "YOUR-PRODUCT-ID"
}
```

**Response Success:**
```json
{
  "statusCode": 200,
  "isLicenseActive": true,
  "licenseCode": {
    "licenseCode": "LICENSECODE12345",
    "status": "ACTIVE",
    "expiredAt": "2025-12-12T19:46:24.000Z",
    "transactionId": "994d4071-a81e-4558-a854-47530eea9b6d",
    "productId": "84d1d247-a8b3-4c7d-96f0-cf276edb7c33",
    "customerId": "6a38cf26-6bab-42c8-92be-72f3a9fd4c33",
    "customerName": "John Doe"
  }
}
```

**Response Failed:**
```json
{
  "statusCode": 400,
  "message": "There's no license with code WRONGLICENSE123 and product"
}
```

### POST Activate License
```
POST /license/activate
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
Content-Type: application/json
```

**Description:**
Endpoint untuk mengaktifkan lisensi. Status kode lisensi akan berubah menjadi ACTIVE.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `licenseCode` | string | Yes | Kode lisensi yang akan diaktifkan |
| `productId` | string | Yes | ID produk yang terkait dengan lisensi |

**Body:**
```json
{
  "licenseCode": "YOUR-LICENSE-CODE",
  "productId": "YOUR-PRODUCT-ID"
}
```

**Response Success:**
```json
{
  "statusCode": 200,
  "message": "Success updating license code status to ACTIVE."
}
```

**Response Failed:**
```json
{
  "statusCode": 400,
  "message": "License code LICENSECODE123 has already active."
}
```

### POST Deactivate License
```
POST /license/deactivate
```

**Headers:**
```
Authorization: Bearer [Your-API-Key]
Content-Type: application/json
```

**Description:**
Endpoint untuk menonaktifkan lisensi. Status kode lisensi akan berubah menjadi INACTIVE.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `licenseCode` | string | Yes | Kode lisensi yang akan dinonaktifkan |
| `productId` | string | Yes | ID produk yang terkait dengan lisensi |

**Body:**
```json
{
  "licenseCode": "YOUR-LICENSE-CODE",
  "productId": "YOUR-PRODUCT-ID"
}
```

**Response Success:**
```json
{
  "statusCode": 200,
  "message": "Success updating license code status to INACTIVE."
}
```

**Response Failed:**
```json
{
  "statusCode": 400,
  "message": "License code LICENSECODE123 has already inactive."
}
```

---

# Summary & Best Practices

## API Coverage
Dokumentasi ini mencakup 11 modul utama Mayar Headless API:

1. **Product** - Manajemen produk dengan berbagai tipe
2. **Invoice** - Sistem invoice dengan item detail
3. **Request Payment** - Penagihan pembayaran tunggal
4. **Installment** - Sistem cicilan
5. **Discount & Coupon** - Sistem diskon dan kupon
6. **Cart** - Keranjang belanja (upcoming)
7. **Customer** - Manajemen customer
8. **Transaction** - Riwayat dan monitoring transaksi
9. **Webhook** - Notifikasi real-time
10. **Software License** - Lisensi software
11. **SaaS Membership** - Subscription-based licensing

## Key Features
- **Multi Payment Methods**: E-wallet, Virtual Account, QRIS, Paylater
- **Real-time Notifications**: 7 jenis webhook events
- **Comprehensive Transaction Management**: Paid/unpaid tracking
- **Flexible Product Types**: 12+ tipe produk berbeda
- **License Management**: Software dan SaaS licensing
- **Customer Portal**: Magic link authentication

## Best Practices

### Security
- Simpan API Key dengan aman
- Jangan expose API Key di client-side
- Gunakan HTTPS untuk semua request
- Implementasikan proper error handling

### Performance
- Patuhi rate limit (20 requests/menit)
- Gunakan pagination untuk large datasets
- Implementasikan caching strategy
- Monitor API usage

### Integration
- Test di sandbox sebelum production
- Implementasikan webhook untuk real-time updates
- Gunakan field projection untuk optimasi response
- Handle timeout dan retry mechanism

### Monitoring
- Monitor webhook delivery status
- Track transaction success rates
- Monitor balance dan settlement
- Log API errors untuk debugging

## Support & Resources

### URLs
- **Production Dashboard**: [https://web.mayar.id](https://web.mayar.id)
- **Sandbox Dashboard**: [https://web.mayar.club](https://web.mayar.club)
- **Main Website**: [https://mayar.id](https://mayar.id)

### Contact
- **Email Support**: info@mayar.id
- **API Documentation**: Tersedia di dashboard
- **Rate Limit**: 20 requests per minute

### Quick Start
1. Daftar di [mayar.id](https://mayar.id)
2. Buat API Key di dashboard
3. Test di sandbox environment
4. Implementasikan webhook
5. Deploy ke production

Dokumentasi ini menyediakan semua informasi yang diperlukan untuk integrasi lengkap dengan Mayar Headless API. Setiap endpoint dilengkapi dengan contoh request/response yang dapat langsung digunakan.