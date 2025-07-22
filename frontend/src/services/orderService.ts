
'use server';

import { Brief, Order, Product, OrderSchema, OrderStatusEnum } from "@/lib/types"; // Import tipe dari pusat
import { InternalServerException, NotFoundException, ValidationException } from "@/lib/exceptions";
import { sendTelegramNotification } from "./notificationService";
import { getBotSettings } from "./botSettingsService";
import { LogContext } from "./logService";


/**
 * Creates the data object for a new payment confirmation.
 * This is an internal helper function.
 * @param orders - The list of orders being confirmed.
 * @param totalAmount - The total payment amount.
 * @returns The data object for the template.
 */
function createPaymentConfirmationMessageData(orders: Order[], totalAmount: number): Record<string, any> {
    if (!orders.length) return {};
    const customer = orders[0]; // Assume same customer for all orders in this batch
    
    return {
      customerName: customer.customerName || 'N/A',
      customerTelegram: customer.customerTelegram?.replace('@', '') || 'N/A',
      totalAmount: totalAmount.toLocaleString('id-ID'),
      orderCount: orders.length,
      orderIds: orders.map(o => o.id),
    };
}


const toPlainOrderObject = async (docId: string, data: any): Promise<Order> => {
    // Fetch briefs from subcollection
    const briefsData: Brief[] = [];
    // const briefsSnapshot = await getDocs(collection(db, "orders", docId, "briefs")); // Removed Firestore call
    // briefsSnapshot.forEach((briefDoc) => {
    //     briefsData.push(briefDoc.data() as Brief);
    // });

    const plainData = {
        id: docId,
        ...data,
        briefs: briefsData,
        createdAt: data.createdAt instanceof Date ? data.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt instanceof Date ? data.updatedAt.toISOString() : undefined,
    };
    
    // Konversi statusHistory jika ada
    if (plainData.statusHistory) {
        for (const key in plainData.statusHistory) {
            if (plainData.statusHistory[key] instanceof Date) {
                plainData.statusHistory[key] = plainData.statusHistory[key].toISOString();
            }
        }
    } else {
        plainData.statusHistory = {};
    }

    // Validasi dengan Zod sebelum mengembalikan
    const validation = OrderSchema.safeParse(plainData);
    if (!validation.success) {
        console.error("Data Firestore tidak valid untuk Order:", validation.error.flatten());
        throw new InternalServerException("Data pesanan di server tidak valid.", { orderId: docId, errors: validation.error.flatten() });
    }

    return validation.data;
};

/**
 * Creates multiple orders from a single cart, splitting them by service tier.
 * @param {Product[]} cart - The global cart containing all items.
 * @returns {Promise<string[]>} A list of the new order IDs.
 */
export async function createMultipleOrdersFromCart(cart: Product[]): Promise<string[]> {
    if (!cart || cart.length === 0) {
        throw new ValidationException("Keranjang tidak boleh kosong.", { cart });
    }

    // const batch = writeBatch(db); // Removed Firestore batch
    const orderIds: string[] = [];

    const cartByTier = cart.reduce((acc, item) => {
        if (!acc[item.tier]) {
            acc[item.tier] = [];
        }
        acc[item.tier].push(item);
        return acc;
    }, {} as Record<string, Product[]>);

    for (const tier in cartByTier) {
        const itemsInTier = cartByTier[tier];
        const createdAt = new Date(); // Use Date object
        
        const subtotal = itemsInTier.reduce((sum, item) => sum + (item.promoPrice || item.price), 0);
        const handlingFee = 2500;
        const uniqueCode = Math.floor(Math.random() * 900) + 100;
        const totalAmount = subtotal + handlingFee + uniqueCode;

        const orderId = `order-${Math.random().toString(36).substring(7)}`; // Generate a dummy ID
        orderIds.push(orderId);

        // batch.set(orderRef, { // Removed Firestore batch set
        //     tier: tier,
        //     subtotal,
        //     handlingFee,
        //     uniqueCode,
        //     totalAmount,
        //     status: "Menunggu Pembayaran",
        //     createdAt: createdAt,
        //     updatedAt: createdAt,
        //     statusHistory: { "Menunggu Pembayaran": createdAt },
        //     customerName: '',
        //     customerPhone: '',
        //     customerTelegram: '',
        // });

        itemsInTier.forEach(item => {
            const briefId = `brief-${Math.random().toString(36).substring(7)}`; // Generate a dummy ID
            const briefData: Brief = {
                instanceId: item.instanceId || briefId,
                productId: item.id,
                productName: item.name,
                briefDetails: item.briefDetails || '',
                googleDriveAssetLinks: item.googleDriveAssetLinks || '',
                tier: item.tier,
                width: item.width || '',
                height: item.height || '',
                unit: item.unit || 'px'
            };
            // batch.set(briefRef, briefData); // Removed Firestore batch set
        });
    }

    // try { // Removed Firestore try-catch
    //     await batch.commit();
    //     return orderIds;
    // } catch (error: any) {
    //     throw new InternalServerException("Gagal menyimpan pesanan ke database.", { originalError: error.message });
    // }
    return orderIds; // Return dummy IDs
}

export async function getOrderById(orderId: string): Promise<Order | null> {
    try {
        // const docRef = doc(db, "orders", orderId); // Removed Firestore doc
        // const docSnap = await getDoc(docRef);

        // if (docSnap.exists()) {
            // return await toPlainOrderObject(docSnap.id, docSnap.data());
        // } else {
            return null; // Return null for dummy data
        // }
    } catch (error: any) {
        console.error("Error fetching document by ID:", error);
        throw new InternalServerException("Gagal mengambil data pesanan.", { orderId, originalError: error.message });
    }
}

// Semua fungsi order dinonaktifkan karena Firestore dihapus
export async function getOrdersDummy() {
  // Contoh data dummy sesuai tipe Order
  const dummyBrief: Brief = {
    instanceId: "dummy-1",
    productId: "prod-1",
    productName: "Produk Dummy",
    tier: "basic",
    briefDetails: "Contoh brief minimal 10 karakter.",
    googleDriveAssetLinks: "",
    width: "",
    height: "",
    unit: "px"
  };
  return [
    {
      id: '1',
      tier: 'basic',
      briefs: [dummyBrief],
      status: OrderStatusEnum.enum["Menunggu Pembayaran"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtotal: 100000,
      handlingFee: 0,
      uniqueCode: 123,
      totalAmount: 100123,
      statusHistory: { 'Menunggu Pembayaran': new Date().toISOString() },
      customerName: 'Budi',
      customerPhone: '08123456789',
      customerTelegram: '@budi',
    },
    {
      id: '2',
      tier: 'premium',
      briefs: [dummyBrief],
      status: OrderStatusEnum.enum["Pesanan Selesai"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtotal: 200000,
      handlingFee: 0,
      uniqueCode: 456,
      totalAmount: 200456,
      statusHistory: { 'Pesanan Selesai': new Date().toISOString() },
      customerName: 'Siti',
      customerPhone: '08987654321',
      customerTelegram: '@siti',
    },
  ];
}

export async function updateOrderWithCustomerInfo(orderId: string, customerData: { name: string; phone: string; telegram: string; }): Promise<void> {
    if (!orderId) {
        throw new ValidationException("ID Pesanan wajib diisi.");
    }
    if (!customerData.name || !customerData.phone || !customerData.telegram) {
        throw new ValidationException("Nama, telepon, dan telegram wajib diisi.", { customerData });
    }

    // const orderRef = doc(db, "orders", orderId); // Removed Firestore doc
    
    // const batch = writeBatch(db); // Removed Firestore batch
    // batch.update(orderRef, { // Removed Firestore batch update
    //     customerName: customerData.name,
    //     customerPhone: customerData.phone,
    //     customerTelegram: customerData.telegram,
    //     updatedAt: serverTimestamp(),
    // });

    // try { // Removed Firestore try-catch
    //     await batch.commit();
    // } catch(error: any) {
    //     if (error.code === 'not-found') {
    //          throw new NotFoundException(`Pesanan dengan ID ${orderId} tidak ditemukan.`, { orderId });
    //     }
    //     throw new InternalServerException("Gagal memperbarui info pelanggan.", { orderId, originalError: error.message });
    // }
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
    const validatedStatus = OrderStatusEnum.safeParse(status);
    if (!orderId || !validatedStatus.success) {
        throw new ValidationException("ID Pesanan dan status baru yang valid wajib diisi.");
    }

    // const orderRef = doc(db, "orders", orderId); // Removed Firestore doc
    // const statusHistoryField = `statusHistory.${status}`; // Removed Firestore field
    // const batch = writeBatch(db); // Removed Firestore batch

    // batch.update(orderRef, { // Removed Firestore batch update
    //     status: status,
    //     updatedAt: serverTimestamp(),
    //     [statusHistoryField]: serverTimestamp()
    // });

    // try { // Removed Firestore try-catch
    //     await batch.commit();
    // } catch(error: any) {
    //     if (error.code === 'not-found') {
    //         throw new NotFoundException(`Pesanan dengan ID ${orderId} tidak ditemukan.`, { orderId });
    //    }
    //    throw new InternalServerException("Gagal memperbarui status pesanan.", { orderId, status, originalError: error.message });
    // }
}


/**
 * Confirms payment for a list of order IDs, changing their status and notifying the admin.
 * @param orderIds The IDs of the orders to confirm.
 */
export async function confirmPayment(orderIds: string[]): Promise<void> {
    if (!orderIds || orderIds.length === 0) {
        throw new ValidationException("Daftar ID Pesanan tidak boleh kosong.");
    }

    // const batch = writeBatch(db); // Removed Firestore batch
    const newStatus = "Pembayaran Sedang Diverifikasi";
    // const statusHistoryField = `statusHistory.${newStatus}`; // Removed Firestore field
    const timestamp = new Date(); // Use Date object

    // Fetch order details to include in the notification
    const orders = await Promise.all(
      orderIds.map(id => getOrderById(id).then(order => {
        if (!order) throw new NotFoundException(`Pesanan dengan ID ${id} tidak ditemukan saat konfirmasi.`);
        return order;
      }))
    );

    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Update Firestore documents
    orderIds.forEach(orderId => {
        // const orderRef = doc(db, "orders", orderId); // Removed Firestore doc
        // batch.update(orderRef, { // Removed Firestore batch update
        //     status: newStatus,
        //     updatedAt: timestamp,
        //     [statusHistoryField]: timestamp
        // });
    });

    try {
        // Get bot settings to check if notification is enabled
        const botSettings = await getBotSettings();

        // Commit changes to database first
        // await batch.commit(); // Removed Firestore commit

        // If notification for this event is enabled, send it.
        if (botSettings.notifyOnPaymentConfirmation) {
            const notificationData = createPaymentConfirmationMessageData(orders, totalAmount);
            const logContext: LogContext = {
                eventType: "Konfirmasi Pembayaran",
                orderIds: orderIds,
                // Do not override chatId here, let the notification service use the admin default
            };
            // This now uses the re-exported function from notificationService
            await sendTelegramNotification(botSettings.templatePaymentConfirmation, notificationData, logContext);
        }

    } catch (error: any) {
         if (error instanceof NotFoundException) {
            throw error; // Re-throw not found exception
         }
        // If notification fails, we don't roll back the DB change.
        // The error is already logged by notificationService.
        // We re-throw it so the client knows something went wrong with the notification part.
        throw new InternalServerException("Status pesanan diperbarui, tapi notifikasi Telegram gagal dikirim. Periksa Log Notifikasi untuk detailnya.");
    }
}

    
