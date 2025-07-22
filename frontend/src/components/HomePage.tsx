
"use client";

import React from "react";

const tiers = [
  {
    name: "Budget Kaki Lima",
    description: "Untuk kebutuhan desain cepat, tunggal, dan tanpa strategi mendalam.",
    best: false,
  },
  {
    name: "Budget UMKM",
    description: "Pilihan paling populer untuk bisnis yang butuh materi marketing rutin.",
    best: true,
  },
  {
    name: "Budget E-commerce",
    description: "Untuk proyek strategis, branding, atau kebutuhan UI/UX kompleks.",
    best: false,
  },
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-[#f7efe9]">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b-2 border-black bg-[#f7efe9]">
        <div className="text-2xl font-bold text-[#ff7a2f]">Urgent <span className="text-black font-normal">Studio</span></div>
        <button className="flex items-center gap-2 border border-black rounded px-4 py-2 bg-white font-semibold relative">
          <span>Keranjang</span>
          <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full px-2">2</span>
        </button>
      </header>

      {/* Search Bar */}
      <div className="w-full bg-[#e0633a] py-16 flex justify-center border-b-2 border-black">
        <form className="flex gap-2">
          <input
            type="text"
            placeholder="Masukkan kode pesanan lengkap Anda..."
            className="rounded px-4 py-2 w-96 border border-black outline-none"
          />
          <button type="submit" className="bg-yellow-300 border border-black px-6 rounded font-bold flex items-center gap-2">
            <span className="text-black">&#128269;</span> Lacak
          </button>
        </form>
      </div>

      {/* Paket Cards */}
      <div className="flex flex-col items-center py-16">
        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-5xl justify-center">
          {tiers.map((tier, idx) => (
            <div
              key={tier.name}
              className="relative bg-white border-2 border-black rounded-2xl shadow-lg p-6 flex-1 min-w-[300px] max-w-[350px] flex flex-col"
              style={{ boxShadow: "6px 8px 0px 0px #000" }}
            >
              {/* Label BEST */}
              {tier.best && (
                <span
                  className="absolute -top-6 right-6 bg-[#ff3b3b] text-white font-extrabold text-sm px-6 py-2 flex items-center justify-center shadow-lg"
                  style={{
                    clipPath:
                      "polygon(100% 50%,78.98% 57.76%,93.3% 75%,71.21% 71.21%,75% 93.3%,57.76% 78.98%,50% 100%,42.24% 78.98%,25% 93.3%,28.79% 71.21%,6.7% 75%,21.02% 57.76%,0% 50%,21.02% 42.24%,6.7% 25%,28.79% 28.79%,25% 6.7%,42.24% 21.02%,50% 0%,57.76% 21.02%,75% 6.7%,71.21% 28.79%,93.3% 25%,78.98% 42.24%)",
                    minWidth: "60px",
                    minHeight: "36px",
                    letterSpacing: "1px",
                  }}
                >
                  BEST
                </span>
              )}
              {/* Gambar/Ilustrasi placeholder */}
              <div className="w-full h-24 bg-gray-100 border-2 border-black rounded-lg mb-4"></div>
              <div className="mb-2">
                <div className="font-bold text-base">{tier.name}</div>
                <div className="text-sm text-gray-700">{tier.description}</div>
              </div>
              {/* Accordion Dummy */}
              <div className="mt-4 space-y-2">
                <button className="w-full flex justify-between items-center bg-yellow-300 border-2 border-black rounded px-4 py-2 font-bold text-black text-sm focus:outline-none">
                  Apa yg kamu dapat <span className="text-xl font-bold">+</span>
                </button>
                <button className="w-full flex justify-between items-center bg-white border-2 border-black rounded px-4 py-2 font-bold text-black text-sm focus:outline-none">
                  Apa yg kamu tidak dapat <span className="text-xl font-bold">-</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Tombol oranye besar di bawah grid */}
        <button
          className="w-full md:w-1/2 bg-gradient-to-r from-[#ff9900] to-[#ff6600] text-white font-bold text-base py-4 rounded-lg shadow-md border-2 border-black hover:brightness-95 transition-all mt-12"
        >
          Lihat Produk
        </button>
      </div>
    </div>
  );
}
