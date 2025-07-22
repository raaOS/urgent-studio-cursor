
export interface ProductMaster {
  id: string;
  name: string;
  tier: "Budget Kaki Lima" | "Budget UMKM" | "Budget E-commerce";
  price: number;
  promoPrice?: number;
  imageUrl: string;
  "data-ai-hint": string;
}

const allProducts: ProductMaster[] = [
  // Budget Kaki Lima
  { id: "bkl-konten-feed", name: "Konten Feed (Single Post)", tier: "Budget Kaki Lima", price: 15000, imageUrl: "https://placehold.co/100x100.png", "data-ai-hint": "social media post" },
  { id: "bkl-konten-carousel", name: "Konten Carousel (3 Slide)", tier: "Budget Kaki Lima", price: 30000, promoPrice: 22000, imageUrl: "https://placehold.co/100x100.png", "data-ai-hint": "carousel interface" },
  { id: "bkl-konten-story", name: "Konten Story (Vertikal)", tier: "Budget Kaki Lima", price: 15000, imageUrl: "https://placehold.co/100x100.png", "data-ai-hint": "phone story" },
  { id: "bkl-kop-surat", name: "Kop Surat (Letterhead)", tier: "Budget Kaki Lima", price: 15000, imageUrl: "https://placehold.co/100x100.png", "data-ai-hint": "letterhead document" },
  { id: "bkl-kartu-nama", name: "Kartu Nama", tier: "Budget Kaki Lima", price: 18000, imageUrl: "https://placehold.co/100x100.png", "data-ai-hint": "business card" },
  
  // Budget UMKM
  { id: "umkm-konten-feed", name: "Konten Feed (Single Post)", tier: "Budget UMKM", price: 25000, imageUrl: "https://placehold.co/100x100.png", "data-ai-hint": "professional post" },
  { id: "umkm-konten-carousel", name: "Konten Carousel (3 Slide)", tier: "Budget UMKM", price: 60000, imageUrl: "https://placehold.co/100x100.png", "data-ai-hint": "marketing carousel" },
  { id: "umkm-brosur", name: "Brosur / Pamflet Promosi", tier: "Budget UMKM", price: 75000, imageUrl: "https://placehold.co/100x100.png", "data-ai-hint": "business brochure" },
  { id: "umkm-x-banner", name: "X-Banner", tier: "Budget UMKM", price: 75000, imageUrl: "https://placehold.co/100x100.png", "data-ai-hint": "x banner stand" },
  { id: "umkm-sampul-ebook", name: "Sampul E-book", tier: "Budget UMKM", price: 70000, imageUrl: "https://placehold.co/100x100.png", "data-ai-hint": "book cover" },

  // Budget E-commerce
  { id: "ecomm-konten-feed", name: "Konten Feed (Single Post)", tier: "Budget E-commerce", price: 70000, imageUrl: "https://placehold.co/100x100.png", "data-ai-hint": "ecommerce post" },
  { id: "ecomm-konten-carousel", name: "Konten Carousel (3 Slide)", tier: "Budget E-commerce", price: 180000, imageUrl: "https://placehold.co/100x100.png", "data-ai-hint": "premium carousel" },
  { id: "ecomm-slide-ppt", name: "Slide Presentasi (PPT)", tier: "Budget E-commerce", price: 425000, imageUrl: "https://placehold.co/100x100.png", "data-ai-hint": "presentation slide" },
  { id: "ecomm-visual-landing-page", name: "Visual Landing Page", tier: "Budget E-commerce", price: 950000, imageUrl: "https://placehold.co/100x100.png", "data-ai-hint": "website design" },
  { id: "ecomm-ui-kit", name: "UI Kit Sederhana", tier: "Budget E-commerce", price: 1200000, promoPrice: 1000000, imageUrl: "https://placehold.co/100x100.png", "data-ai-hint": "ui components" },
];


export const getProductsForTier = (tierName: string): ProductMaster[] => {
    return allProducts.filter(product => product.tier === tierName);
};

export const getAllProducts = (): ProductMaster[] => {
    return allProducts;
}
