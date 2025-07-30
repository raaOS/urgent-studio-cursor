const products = [
  // JDS-01 to JDS-06 (Kategori: jasa-satuan-basic)
  {
    id: "JDS-01",
    name: "Desain Konten Feed (Single Post)",
    description: "Desain konten feed untuk media sosial yang menarik dan profesional",
    price: 15000,
    category: "jasa-satuan",
    imageUrl: "https://placehold.co/300x300/ff7a2f/white?text=Feed+Post",
    features: ["Format JPG/PNG", "Resolusi HD", "1 konsep desain", "2x revisi minor"],
    deliveryTime: "1-2 hari",
    revisions: 2,
    popular: true
  },
  {
    id: "JDS-02", 
    name: "Desain Konten Carousel (3 Slide)",
    description: "Desain carousel 3 slide untuk storytelling yang efektif di media sosial",
    price: 30000,
    category: "jasa-satuan",
    imageUrl: "https://placehold.co/300x300/ff7a2f/white?text=Carousel",
    features: ["3 slide design", "Format JPG/PNG", "Resolusi HD", "2 konsep awal", "3x revisi"],
    deliveryTime: "2-3 hari",
    revisions: 3,
    popular: true
  },
  {
    id: "JDS-03",
    name: "Desain Konten Story (Vertikal)", 
    description: "Desain story vertikal untuk Instagram dan media sosial lainnya",
    price: 15000,
    category: "jasa-satuan",
    imageUrl: "https://placehold.co/300x300/ff7a2f/white?text=Story",
    features: ["Format vertikal 9:16", "Format JPG/PNG", "Resolusi HD", "1 konsep desain", "2x revisi"],
    deliveryTime: "1-2 hari", 
    revisions: 2,
    popular: false
  },
  {
    id: "JDS-04",
    name: "Desain Kop Surat (Letterhead)",
    description: "Desain kop surat profesional untuk kebutuhan bisnis formal",
    price: 15000,
    category: "jasa-satuan",
    imageUrl: "https://placehold.co/300x300/ff7a2f/white?text=Letterhead",
    features: ["Format A4", "File PDF siap cetak", "File editable", "1 konsep desain", "2x revisi"],
    deliveryTime: "1-2 hari",
    revisions: 2,
    popular: false
  },
  {
    id: "JDS-05",
    name: "Desain Kartu Nama",
    description: "Desain kartu nama profesional dengan layout yang menarik", 
    price: 18000,
    category: "jasa-satuan",
    imageUrl: "https://placehold.co/300x300/ff7a2f/white?text=Business+Card",
    features: ["Ukuran standar 9x5.5cm", "File PDF siap cetak", "2 sisi (depan-belakang)", "2 konsep awal", "3x revisi"],
    deliveryTime: "1-2 hari",
    revisions: 3,
    popular: true
  },
  {
    id: "JDS-06",
    name: "Desain Frame Foto Profil (Twibbon)",
    description: "Desain frame foto profil untuk event atau kampanye khusus",
    price: 18000,
    category: "jasa-satuan", 
    imageUrl: "https://placehold.co/300x300/ff7a2f/white?text=Twibbon",
    features: ["Format PNG transparan", "Resolusi HD", "File editable", "2 konsep awal", "3x revisi"],
    deliveryTime: "1-2 hari",
    revisions: 3,
    popular: false
  },
  // JDS-07 to JDS-14 (Kategori: jasa-satuan-medium)
  {
    id: "JDS-07",
    name: "Desain Sertifikat / Piagam",
    description: "Desain sertifikat atau piagam untuk penghargaan dan event",
    price: 20000,
    category: "jasa-satuan",
    imageUrl: "https://placehold.co/300x300/3b82f6/white?text=Certificate",
    features: ["Format A4 landscape", "File PDF siap cetak", "File editable", "2 konsep awal", "3x revisi"],
    deliveryTime: "2-3 hari",
    revisions: 3,
    popular: false
  },
  {
    id: "JDS-08",
    name: "Desain Lanyard / Tali ID Card",
    description: "Desain lanyard profesional untuk event dan perusahaan",
    price: 20000,
    category: "jasa-satuan",
    imageUrl: "https://placehold.co/300x300/3b82f6/white?text=Lanyard", 
    features: ["Ukuran standar 2x90cm", "File PDF siap cetak", "2 sisi printing", "2 konsep awal", "3x revisi"],
    deliveryTime: "2-3 hari",
    revisions: 3,
    popular: false
  },
  {
    id: "JDS-09",
    name: "Desain Poster (Ukuran A4)",
    description: "Desain poster promosi ukuran A4 untuk berbagai kebutuhan",
    price: 22000,
    category: "jasa-satuan",
    imageUrl: "https://placehold.co/300x300/3b82f6/white?text=Poster+A4",
    features: ["Format A4 portrait/landscape", "File PDF siap cetak", "Resolusi 300 DPI", "2 konsep awal", "4x revisi"],
    deliveryTime: "2-3 hari", 
    revisions: 4,
    popular: true
  },
  {
    id: "JDS-10",
    name: "Desain Buku Menu",
    description: "Desain buku menu untuk restoran dan cafe yang menarik",
    price: 25000,
    category: "jasa-satuan",
    imageUrl: "https://placehold.co/300x300/3b82f6/white?text=Menu+Book",
    features: ["Multi halaman", "File PDF siap cetak", "Layout profesional", "2 konsep awal", "4x revisi"],
    deliveryTime: "3-4 hari",
    revisions: 4,
    popular: true
  },
  {
    id: "JDS-11",
    name: "Desain Undangan Digital / Cetak",
    description: "Desain undangan untuk event digital maupun cetak",
    price: 25000,
    category: "jasa-satuan",
    imageUrl: "https://placehold.co/300x300/3b82f6/white?text=Invitation",
    features: ["Format digital & cetak", "File PDF & JPG", "Desain elegan", "2 konsep awal", "4x revisi"],
    deliveryTime: "3-4 hari",
    revisions: 4,
    popular: true
  },
  {
    id: "JDS-12", 
    name: "Desain Brosur / Pamflet Promosi",
    description: "Desain brosur promosi yang informatif dan menarik",
    price: 35000,
    category: "jasa-satuan",
    imageUrl: "https://placehold.co/300x300/3b82f6/white?text=Brochure",
    features: ["2-3 fold design", "File PDF siap cetak", "Resolusi 300 DPI", "3 konsep awal", "5x revisi"],
    deliveryTime: "3-5 hari",
    revisions: 5,
    popular: true
  },
  {
    id: "JDS-13",
    name: "Desain X-Banner", 
    description: "Desain X-Banner untuk display event dan promosi",
    price: 35000,
    category: "jasa-satuan",
    imageUrl: "https://placehold.co/300x300/3b82f6/white?text=X-Banner",
    features: ["Ukuran 60x160cm", "File PDF siap cetak", "Resolusi 300 DPI", "3 konsep awal", "5x revisi"],
    deliveryTime: "3-5 hari",
    revisions: 5,
    popular: false
  },
  {
    id: "JDS-14",
    name: "Desain Sampul E-book",
    description: "Desain sampul e-book yang profesional dan eye-catching",
    price: 35000,
    category: "jasa-satuan",
    imageUrl: "https://placehold.co/300x300/3b82f6/white?text=E-book+Cover",
    features: ["Format digital", "3D mockup", "File PNG/JPG", "3 konsep awal", "5x revisi"],
    deliveryTime: "3-5 hari",
    revisions: 5,
    popular: false
  },
  // JDS-15 to JDS-19 (Kategori: jasa-satuan-premium)
  {
    id: "JDS-15",
    name: "Desain Spanduk / Banner Outdoor",
    description: "Desain spanduk outdoor untuk promosi skala besar",
    price: 40000,
    category: "jasa-satuan",
    imageUrl: "https://placehold.co/300x300/8b5cf6/white?text=Outdoor+Banner",
    features: ["Ukuran custom", "File PDF siap cetak", "Resolusi 300 DPI", "3 konsep awal", "Unlimited revisi"],
    deliveryTime: "4-6 hari",
    revisions: -1,
    popular: false
  },
  {
    id: "JDS-16",
    name: "Desain Roll-Up Banner",
    description: "Desain roll-up banner untuk event dan display indoor",
    price: 45000,
    category: "jasa-satuan",
    imageUrl: "https://placehold.co/300x300/8b5cf6/white?text=Roll-Up+Banner",
    features: ["Ukuran 85x200cm", "File PDF siap cetak", "Resolusi 300 DPI", "3 konsep awal", "Unlimited revisi"],
    deliveryTime: "4-6 hari",
    revisions: -1,
    popular: true
  },
  {
    id: "JDS-17",
    name: "Desain Gerbang Acara (Gate)",
    description: "Desain gerbang acara yang megah dan menarik perhatian",
    price: 70000,
    category: "jasa-satuan",
    imageUrl: "https://placehold.co/300x300/8b5cf6/white?text=Event+Gate",
    features: ["Ukuran custom", "File PDF siap cetak", "3D visualization", "4 konsep awal", "Unlimited revisi"],
    deliveryTime: "5-7 hari",
    revisions: -1,
    popular: false
  },
  {
    id: "JDS-18",
    name: "Desain Slide Presentasi (PPT)",
    description: "Desain slide presentasi profesional untuk business pitch",
    price: 70000,
    category: "jasa-satuan",
    imageUrl: "https://placehold.co/300x300/8b5cf6/white?text=PPT+Slides",
    features: ["10-15 slide template", "File PPTX editable", "Desain konsisten", "4 konsep awal", "Unlimited revisi"],
    deliveryTime: "5-7 hari",
    revisions: -1,
    popular: true
  },
  {
    id: "JDS-19",
    name: "Desain Visual Landing Page",
    description: "Desain visual landing page yang conversion-focused",
    price: 125000,
    category: "jasa-satuan",
    imageUrl: "https://placehold.co/300x300/8b5cf6/white?text=Landing+Page",
    features: ["Responsive design", "File Figma/PSD", "UI/UX optimized", "5 konsep awal", "Unlimited revisi"],
    deliveryTime: "7-10 hari",
    revisions: -1,
    popular: true
  }
];

export default products;

// Named exports for compatibility
export const getAllProducts = () => products;
export type ProductMaster = typeof products[0];