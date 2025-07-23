/**
 * @fileOverview Sistem penanganan error terpusat untuk aplikasi.
 * 
 * File ini mendefinisikan kelas `AppException` kustom, yang merupakan fondasi
 * untuk error yang terstruktur di seluruh aplikasi. Tujuannya adalah untuk
 * memberikan konteks yang kaya pada setiap error, termasuk kode status HTTP,
 * pesan yang ramah pengguna, dan detail logging untuk developer.
 */

/**
 * Kelas dasar untuk semua error terstruktur dalam aplikasi.
 * Setiap error yang diharapkan (mis. input tidak valid, data tidak ditemukan)
 * harus merupakan turunan dari kelas ini.
 */
export class AppException extends Error {
  /**
   * Kode status HTTP yang sesuai untuk error ini (mis. 400, 404, 500).
   */
  public readonly statusCode: number;

  /**
   * Kode error internal yang unik untuk identifikasi masalah secara terprogram.
   * Contoh: 'E_VALIDATION_FAILED', 'E_ORDER_NOT_FOUND'.
   */
  public readonly errorCode: string;

  /**
   * Detail tambahan atau konteks tentang error, berguna untuk logging.
   * Dapat berisi objek apa pun yang relevan.
   */
  public readonly context?: Record<string, unknown>;

  /**
   * @param statusCode Kode status HTTP.
   * @param message Pesan error yang bisa ditampilkan ke pengguna.
   * @param errorCode Kode error internal yang unik.
   * @param context Detail tambahan untuk logging.
   */
  constructor(
    statusCode: number,
    message: string,
    errorCode: string,
    context?: Record<string, unknown>
  ) {
    super(message); // Memanggil constructor dari kelas Error bawaan
    
    // Memastikan nama kelas ini benar saat dilihat di stack trace
    Object.setPrototypeOf(this, new.target.prototype);
    
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.name = this.constructor.name;
    
    // Only assign context if it exists and has properties
    if (context !== null && context !== undefined && Object.keys(context).length > 0) {
      this.context = context;
    }

    // Menangkap stack trace, tidak termasuk frame constructor ini
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// --- Contoh implementasi error spesifik ---

/**
 * Error yang dilempar ketika validasi input gagal.
 */
export class ValidationException extends AppException {
  constructor(message: string, context?: Record<string, unknown>) {
    super(400, message, 'E_VALIDATION_FAILED', context);
  }
}

/**
 * Error yang dilempar ketika sebuah resource tidak ditemukan.
 */
export class NotFoundException extends AppException {
  constructor(message: string, context?: Record<string, unknown>) {
    super(404, message, 'E_RESOURCE_NOT_FOUND', context);
  }
}

/**
 * Error untuk masalah internal server yang tidak terduga.
 */
export class InternalServerException extends AppException {
    constructor(message: string = 'Terjadi kesalahan internal pada server.', context?: Record<string, unknown>) {
      super(500, message, 'E_INTERNAL_SERVER', context);
    }
  }
