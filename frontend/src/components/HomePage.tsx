"use client";

import Link from "next/link";
import React from "react";

export function HomePage() {
  return (
    <div className="min-h-screen bg-[#f7efe9]">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b-2 border-black bg-[#f7efe9]">
        <div className="text-2xl font-bold text-[#ff7a2f]">Urgent <span className="text-black font-normal">Studio</span></div>
        <button className="flex items-center gap-2 border border-black rounded px-4 py-2 bg-white font-semibold relative">
          <span>Keranjang</span>
          <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full px-2">0</span>
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

      {/* Hero Section */}
      <div className="flex flex-col items-center py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Jasa Desain Grafis Profesional
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            19 layanan desain berkualitas dengan harga terjangkau
          </p>
          <p className="text-lg text-gray-600">
            Dari konten sosial media hingga desain landing page
          </p>
        </div>

        {/* Product Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mb-12 px-4">
          {/* Basic Products */}
          <div className="bg-white border-2 border-black rounded-2xl shadow-lg p-6"
               style={{ boxShadow: "6px 8px 0px 0px #ff7a2f" }}>
            <div className="w-full h-32 bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-black rounded-lg mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-orange-600">JDS-01</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Desain Konten Feed</h3>
            <p className="text-sm text-gray-600 mb-3">Konten media sosial yang menarik</p>
            <div className="text-xl font-bold text-orange-600 mb-3">Rp 15.000</div>
            <div className="text-sm text-gray-500">Mulai dari harga terjangkau</div>
          </div>

          {/* Medium Products */}
          <div className="bg-white border-2 border-black rounded-2xl shadow-lg p-6"
               style={{ boxShadow: "6px 8px 0px 0px #3b82f6" }}>
            <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-black rounded-lg mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">JDS-12</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Desain Brosur</h3>
            <p className="text-sm text-gray-600 mb-3">Promosi yang informatif dan menarik</p>
            <div className="text-xl font-bold text-blue-600 mb-3">Rp 35.000</div>
            <div className="text-sm text-gray-500">Untuk kebutuhan marketing</div>
          </div>

          {/* Premium Products */}
          <div className="bg-white border-2 border-black rounded-2xl shadow-lg p-6"
               style={{ boxShadow: "6px 8px 0px 0px #8b5cf6" }}>
            <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-black rounded-lg mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600">JDS-19</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Landing Page</h3>
            <p className="text-sm text-gray-600 mb-3">Desain visual yang conversion-focused</p>
            <div className="text-xl font-bold text-purple-600 mb-3">Rp 125.000</div>
            <div className="text-sm text-gray-500">Solusi bisnis premium</div>
          </div>
        </div>

        {/* CTA Button */}
        <Link 
          href="/products" 
          className="w-full md:w-1/2 bg-gradient-to-r from-[#ff9900] to-[#ff6600] text-white font-bold text-lg py-4 rounded-lg shadow-md border-2 border-black hover:brightness-95 transition-all text-center inline-block"
          style={{ boxShadow: "4px 4px 0px 0px #000" }}
        >
          Lihat Semua Produk (19 Jasa Desain)
        </Link>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-16 px-4">
          <div className="text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h4 className="font-bold mb-2">Pengerjaan Cepat</h4>
            <p className="text-sm text-gray-600">1-10 hari sesuai kompleksitas</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">💎</div>
            <h4 className="font-bold mb-2">Kualitas Profesional</h4>
            <p className="text-sm text-gray-600">Desain berkualitas tinggi</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🔄</div>
            <h4 className="font-bold mb-2">Revisi Gratis</h4>
            <p className="text-sm text-gray-600">2x hingga unlimited revisi</p>
          </div>
        </div>
      </div>
    </div>
  );
}