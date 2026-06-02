import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Printer, 
  Download, 
  Settings, 
  RefreshCw, 
  Image, 
  Palette, 
  Coins, 
  Calendar, 
  FileText,
  User,
  Phone,
  HelpCircle,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Copy,
  LayoutGrid
} from 'lucide-react';

export default function App() {
  // Pilihan Tema Warna Premium
  const themes = [
    {
      id: 'forest',
      name: 'Forest Green (Pinarak)',
      primary: '#064e3b', // deep emerald
      secondary: '#b45309', // amber/gold
      accent: '#f0fdf4', // light mint green
      bg: 'bg-emerald-900',
      text: 'text-emerald-900',
      border: 'border-emerald-900/20'
    },
    {
      id: 'navy',
      name: 'Royal Blue',
      primary: '#1e3a8a', // deep blue
      secondary: '#0284c7', // light blue
      accent: '#f0f9ff', // light sky blue
      bg: 'bg-blue-900',
      text: 'text-blue-900',
      border: 'border-blue-900/20'
    },
    {
      id: 'gold',
      name: 'Luxury Gold',
      primary: '#1a1a1a', // charcoal black
      secondary: '#ca8a04', // golden yellow
      accent: '#fafaf9', // warm stone
      bg: 'bg-stone-900',
      text: 'text-stone-900',
      border: 'border-stone-900/20'
    },
    {
      id: 'crimson',
      name: 'Warm Crimson',
      primary: '#7f1d1d', // deep red
      secondary: '#db2777', // rose accent
      accent: '#fff1f2', // light rose
      bg: 'bg-rose-900',
      text: 'text-rose-900',
      border: 'border-rose-900/20'
    }
  ];

  // Presets Villa & Layanan Tambahan untuk Input Cepat
  const villaPresets = [
    { name: 'Pinarak Villa Premium (Pool + Jacuzzi)', price: 3500000 },
    { name: 'Pinarak Family Villa (4 Bed Rooms)', price: 2800000 },
    { name: 'Pinarak Cozy Suite (Mountain View)', price: 1800000 },
    { name: 'Extra Bed Premium', price: 150000 },
    { name: 'Paket BBQ & Grill Set', price: 250000 }
  ];

  // --- States ---
  const [activeTheme, setActiveTheme] = useState(themes[0]);
  
  // States untuk Logo Baru (Mode 1 Logo vs 2 Logo)
  const [logoMode, setLogoMode] = useState('double'); // default 'double' agar mirip dokumen asli .docx Anda
  const [logoLeft, setLogoLeft] = useState(null); // base64 logo kiri
  const [logoRight, setLogoRight] = useState(null); // base64 logo kanan
  const [useSameLogo, setUseSameLogo] = useState(true); // copy logo kiri ke kanan otomatis

  const [isDownloading, setIsDownloading] = useState(false);
  const [toast, setToast] = useState(null); // State Notifikasi Pop-up
  
  // Informasi Utama Bisnis (Bisa diedit live)
  const [businessName, setBusinessName] = useState('PINARAK VILLA');
  const [businessManagement, setBusinessManagement] = useState('PINARAK VILLA MANAGEMENT');
  const [businessTagline, setBusinessTagline] = useState('SEWA VILLA NYAMAN — TERLENGKAP DI KOTA WISATA BATU');
  const [businessLocation, setBusinessLocation] = useState('KOTA BATU • JAWA TIMUR • INDONESIA');

  // Informasi Pelanggan & Invoice
  const [customerName, setCustomerName] = useState('Bpk. Budi Sentosa');
  const [customerPhone, setCustomerPhone] = useState('0812-3456-7890');
  const [invoiceNo, setInvoiceNo] = useState(`INV/${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}/012`);
  const [paymentMethod, setPaymentMethod] = useState('Transfer BCA');
  
  // Rentang Waktu Booking
  const [checkInDate, setCheckInDate] = useState('2026-06-15');
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutDate, setCheckOutDate] = useState('2026-06-17');
  const [checkOutTime, setCheckOutTime] = useState('11:00');

  // Informasi Rekening Bank
  const [bankName, setBankName] = useState('BCA (Bank Central Asia)');
  const [bankNumber, setBankNumber] = useState('816-091-XXXX');
  const [bankHolder, setBankHolder] = useState('Ivan Adiluhung');

  // Daftar Item Sewa
  const [items, setItems] = useState([
    { id: '1', name: 'Pinarak Villa Premium (Private Pool & Jacuzzi)', price: 3500000, qty: 2 },
    { id: '2', name: 'Extra Bed Premium Set', price: 150000, qty: 2 },
    { id: '3', name: 'Sewa Alat BBQ Arang Set', price: 250000, qty: 1 }
  ]);

  // Nominal DP & Potongan Diskon
  const [dpValue, setDpValue] = useState(1500000);
  const [discountValue, setDiscountValue] = useState(200000);

  // Catatan & Kebijakan Villa
  const [notes, setNotes] = useState([
    'DP tidak dapat direfund jika ada pembatalan sepihak.',
    'Reschedule diperbolehkan maksimal 1x (paling lambat H-14 check-in).'
  ]);
  const [newNote, setNewNote] = useState('');

  const [footerBannerText, setFooterBannerText] = useState('PELUNASAN WAJIB H-1 SEBELUM CHECK-IN');

  // Efek Samping: Jika mode "Gunakan Logo yang Sama" aktif, sinkronkan logo kanan dengan logo kiri
  useEffect(() => {
    if (useSameLogo && logoLeft) {
      setLogoRight(logoLeft);
    }
  }, [logoLeft, useSameLogo]);

  // Fungsi Pemicu Toast (Notifikasi UI)
  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Format Angka ke Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  // --- Kalkulasi Keuangan ---
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalBill = subtotal - dpValue - discountValue;

  // Handlers untuk Unggah Logo
  const handleLogoLeftUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoLeft(reader.result);
        if (useSameLogo) {
          setLogoRight(reader.result);
        }
        triggerToast('Logo Kiri berhasil diunggah!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoRightUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoRight(reader.result);
        triggerToast('Logo Kanan berhasil diunggah!');
      };
      reader.readAsDataURL(file);
    }
  };

  const resetLogos = () => {
    setLogoLeft(null);
    setLogoRight(null);
    triggerToast('Semua logo kustom telah dihapus.');
  };

  const handleItemChange = (id, field, value) => {
    const updated = items.map(item => {
      if (item.id === id) {
        let val = value;
        if (field === 'price' || field === 'qty') {
          val = isNaN(Number(value)) ? 0 : Number(value);
        }
        return { ...item, [field]: val };
      }
      return item;
    });
    setItems(updated);
  };

  const addItem = (name = '', price = 0) => {
    const newItem = {
      id: Date.now().toString(),
      name: name || 'Nama Villa / Layanan Baru',
      price: price || 0,
      qty: 1
    };
    setItems([...items, newItem]);
    triggerToast('Item baru berhasil ditambahkan');
  };

  const deleteItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
      triggerToast('Item berhasil dihapus', 'info');
    } else {
      triggerToast('Harus menyisakan minimal 1 baris item!', 'error');
    }
  };

  const handleAddNote = () => {
    if (newNote.trim() !== '') {
      setNotes([...notes, newNote]);
      setNewNote('');
      triggerToast('Catatan kebijakan ditambahkan');
    }
  };

  const removeNote = (index) => {
    setNotes(notes.filter((_, i) => i !== index));
    triggerToast('Catatan kebijakan dihapus', 'info');
  };

  // Pembuatan Berkas PDF di Sisi Klien menggunakan html2pdf.js
  const handleDownloadPDF = () => {
    setIsDownloading(true);
    triggerToast('Sedang mempersiapkan rendering file PDF...', 'info');

    const element = document.getElementById('invoice-capture-area');
    
    const opt = {
      margin:       [10, 10, 10, 10], // Margins (atas, kiri, bawah, kanan) dalam mm
      filename:     `Invoice_${customerName.replace(/[^a-zA-Z0-9]/g, '_')}_${invoiceNo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2.2, // Tingkat ketajaman gambar PDF
        useCORS: true,
        logging: false,
        letterRendering: true
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const runPdfConverter = () => {
      window.html2pdf()
        .from(element)
        .set(opt)
        .save()
        .then(() => {
          setIsDownloading(false);
          triggerToast('PDF Berhasil Diunduh!');
        })
        .catch((err) => {
          console.error(err);
          setIsDownloading(false);
          triggerToast('Terjadi kesalahan saat memproses ekspor PDF.', 'error');
        });
    };

    if (window.html2pdf) {
      runPdfConverter();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.crossOrigin = 'anonymous';
      script.onload = runPdfConverter;
      script.onerror = () => {
        setIsDownloading(false);
        triggerToast('Gagal memuat sistem generator PDF. Periksa jaringan Anda.', 'error');
      };
      document.body.appendChild(script);
    }
  };

  const triggerPrint = () => {
    triggerToast('Membuka dialog cetak sistem browser...', 'info');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Elegant Default SVG Logo Generator
  const renderDefaultLogo = (sideText) => (
    <div className="flex flex-col items-center justify-center scale-90">
      <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-4" style={{ borderColor: activeTheme.primary }}>
        <div className="absolute inset-1.5 rounded-full border border-dashed opacity-50" style={{ borderColor: activeTheme.secondary }}></div>
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10Z" stroke={activeTheme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 21V12H15V21" stroke={activeTheme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="7" r="1.5" fill={activeTheme.secondary} />
        </svg>
      </div>
      <span className="text-[9px] uppercase font-bold tracking-widest mt-1" style={{ color: activeTheme.secondary }}>{sideText}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      
      {/* Toast Notification Pop-up */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-xl border bg-white text-slate-800 transition-all transform animate-bounce">
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
          {toast.type === 'info' && <Sparkles className="w-5 h-5 text-indigo-600" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header UI Aplikasi (Sembunyikan saat cetak) */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-10 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-800 tracking-tight">Pinarak Villa Invoice Generator</h1>
              <p className="text-xs text-slate-500">Kustomisasi invoice villa mewah Anda dengan mode logo kustom & Ekspor ke PDF</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition duration-150 shadow-sm text-sm ${
                isDownloading 
                  ? 'bg-emerald-800 text-emerald-200 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Download className={`w-4 h-4 ${isDownloading ? 'animate-spin' : ''}`} />
              {isDownloading ? 'Mengunduh PDF...' : 'Unduh PDF Langsung'}
            </button>
            
            <button
              onClick={triggerPrint}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium transition duration-150 shadow-sm text-sm"
            >
              <Printer className="w-4 h-4" />
              Cetak / Print Manual
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        
        {/* SIDEBAR EDITORS (Sembunyikan saat cetak) */}
        <section className="lg:col-span-4 space-y-6 print:hidden">
          
          {/* Konfigurasi Logo & Layout */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-500" />
              Konfigurasi Layout Logo
            </h2>

            <div className="space-y-4">
              {/* Toggle Mode Logo */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Mode Penempatan Logo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setLogoMode('single');
                      triggerToast('Layout diubah ke 1 Logo Tengah');
                    }}
                    className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition ${
                      logoMode === 'single' 
                        ? 'border-slate-800 bg-slate-50 ring-1 ring-slate-800 text-slate-900' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    1 Logo Tengah
                  </button>
                  <button
                    onClick={() => {
                      setLogoMode('double');
                      triggerToast('Layout diubah ke 2 Logo Mengapit');
                    }}
                    className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition ${
                      logoMode === 'double' 
                        ? 'border-slate-800 bg-slate-50 ring-1 ring-slate-800 text-slate-900' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    2 Logo (Mengapit)
                  </button>
                </div>
              </div>

              {/* Checkbox Samakan Logo jika di Mode Double */}
              {logoMode === 'double' && (
                <div className="flex items-center gap-2 py-1 bg-slate-50 px-2.5 rounded-lg border border-slate-150">
                  <input 
                    type="checkbox" 
                    id="sameLogoCheck" 
                    checked={useSameLogo}
                    onChange={(e) => {
                      setUseSameLogo(e.target.checked);
                      if (e.target.checked && logoLeft) {
                        setLogoRight(logoLeft);
                      }
                      triggerToast(e.target.checked ? 'Logo disamakan secara otomatis' : 'Logo kanan diatur mandiri');
                    }}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="sameLogoCheck" className="text-xs font-medium text-slate-600 cursor-pointer select-none">
                    Gunakan logo yang sama untuk Kiri & Kanan
                  </label>
                </div>
              )}

              {/* Uploaders Logo */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                {/* LOGO KIRI (Atau Logo Utama jika Single) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {logoMode === 'double' ? 'Logo Sisi Kiri' : 'Logo Utama'}
                  </label>
                  {logoLeft ? (
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <img src={logoLeft} alt="Preview Kiri" className="h-10 w-10 object-contain rounded" />
                      <button 
                        onClick={() => {
                          setLogoLeft(null);
                          if (useSameLogo) setLogoRight(null);
                          triggerToast('Logo berhasil dihapus.');
                        }} 
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoLeftUpload}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                    />
                  )}
                </div>

                {/* LOGO KANAN (Hanya muncul jika Mode Double & tidak dicentang samakan) */}
                {logoMode === 'double' && !useSameLogo && (
                  <div className="pt-2 border-t border-dashed border-slate-200">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Logo Sisi Kanan</label>
                    {logoRight ? (
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <img src={logoRight} alt="Preview Kanan" className="h-10 w-10 object-contain rounded" />
                        <button 
                          onClick={() => {
                            setLogoRight(null);
                            triggerToast('Logo kanan berhasil dihapus.');
                          }} 
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoRightUpload}
                        className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Tombol Reset Semua Logo */}
              {(logoLeft || logoRight) && (
                <button
                  onClick={resetLogos}
                  className="w-full text-center py-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg border border-transparent transition"
                >
                  Reset Semua Logo Kustom
                </button>
              )}
            </div>
          </div>

          {/* Preset Tampilan Warna */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-slate-500" />
              Tema Warna Premium
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTheme(t);
                    triggerToast(`Warna diganti ke ${t.name}`);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium text-left transition ${
                    activeTheme.id === t.id 
                      ? 'border-slate-800 bg-slate-50 ring-1 ring-slate-800' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: t.primary }}></span>
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Informasi Bisnis / Pengelola */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-500" />
              Identitas Pengelola
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nama Brand Utama</label>
                <input 
                  type="text" 
                  value={businessName} 
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nama Manajemen</label>
                <input 
                  type="text" 
                  value={businessManagement} 
                  onChange={(e) => setBusinessManagement(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Tagline</label>
                <input 
                  type="text" 
                  value={businessTagline} 
                  onChange={(e) => setBusinessTagline(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Lokasi / Alamat Singkat</label>
                <input 
                  type="text" 
                  value={businessLocation} 
                  onChange={(e) => setBusinessLocation(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Detail Customer & Invoice */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              Detail Reservasi
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Nama Tamu</label>
                  <input 
                    type="text" 
                    value={customerName} 
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">No. HP / WA</label>
                  <input 
                    type="text" 
                    value={customerPhone} 
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">No. Invoice</label>
                  <input 
                    type="text" 
                    value={invoiceNo} 
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Metode Bayar</label>
                  <input 
                    type="text" 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-xs font-semibold text-slate-600 block mb-2">Tanggal Menginap</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400">Check-In</label>
                    <input 
                      type="date" 
                      value={checkInDate} 
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded focus:outline-none"
                    />
                    <input 
                      type="text" 
                      value={checkInTime} 
                      placeholder="14:00"
                      onChange={(e) => setCheckInTime(e.target.value)}
                      className="w-full text-xs px-2 py-1 border border-slate-200 rounded mt-1 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">Check-Out</label>
                    <input 
                      type="date" 
                      value={checkOutDate} 
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded focus:outline-none"
                    />
                    <input 
                      type="text" 
                      value={checkOutTime} 
                      placeholder="11:00"
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      className="w-full text-xs px-2 py-1 border border-slate-200 rounded mt-1 text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preset Villa & Layanan */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <Coins className="w-4 h-4 text-slate-500" />
              Quick Presets
            </h2>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {villaPresets.map((v, idx) => (
                <button
                  key={idx}
                  onClick={() => addItem(v.name, v.price)}
                  className="w-full flex items-center justify-between p-2 text-left text-xs bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100 transition"
                >
                  <span className="font-medium truncate max-w-[180px]">{v.name}</span>
                  <span className="text-emerald-700 font-semibold">{formatRupiah(v.price)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rekening & Catatan */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              Rekening & Catatan
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nama Bank</label>
                <input 
                  type="text" 
                  value={bankName} 
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">No Rekening</label>
                  <input 
                    type="text" 
                    value={bankNumber} 
                    onChange={(e) => setBankNumber(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Atas Nama</label>
                  <input 
                    type="text" 
                    value={bankHolder} 
                    onChange={(e) => setBankHolder(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <label className="block text-xs font-semibold text-slate-600 mb-2">Kebijakan / T&C</label>
                <div className="space-y-1 mb-2">
                  {notes.map((note, index) => (
                    <div key={index} className="flex items-start justify-between gap-1 text-xs bg-red-50 text-red-800 p-2 rounded">
                      <span className="flex-1">• {note}</span>
                      <button 
                        onClick={() => removeNote(index)}
                        className="text-red-500 hover:text-red-800 font-bold px-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Tambah catatan..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg"
                  />
                  <button 
                    onClick={handleAddNote}
                    className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-slate-950"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* LIVE INVOICE PREVIEW / KERTAS KERJA */}
        <section className="lg:col-span-8 flex flex-col items-center">
          
          <div className="w-full max-w-[21cm] bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-xs text-amber-900 flex items-start gap-2.5 shadow-sm print:hidden">
            <HelpCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">💡 Tips Pengeditan WYSIWYG</span>
              Anda dapat mengklik dan mengedit teks langsung pada kertas invoice di bawah ini! Semua kalkulasi harga di baris item, sisa DP, dan sisa tagihan akan otomatis diperbarui secara instan.
            </div>
          </div>

          {/* KERTAS A4 SIMULASI */}
          <div 
            id="invoice-capture-area"
            className="w-full max-w-[21cm] min-h-[29.7cm] bg-white text-slate-800 p-8 shadow-xl border border-slate-200 rounded-lg flex flex-col justify-between relative overflow-hidden print:shadow-none print:border-none print:m-0 print:p-0 print:rounded-none"
            style={{ 
              boxSizing: 'border-box',
              fontFamily: 'Inter, system-ui, sans-serif'
            }}
          >
            
            {/* Latar Belakang Lingkaran Dekoratif (Aksen Desain Premium) */}
            <div className="absolute top-[-120px] right-[-120px] w-[350px] h-[350px] rounded-full opacity-[0.03] pointer-events-none" style={{ border: `45px solid ${activeTheme.primary}` }}></div>
            <div className="absolute bottom-[-150px] left-[-150px] w-[350px] h-[350px] rounded-full opacity-[0.02] pointer-events-none" style={{ border: `30px solid ${activeTheme.secondary}` }}></div>

            <div>
              
              {/* KOP SURAT (DENGAN LAYOUT DINAMIS: 1 LOGO vs 2 LOGO) */}
              {logoMode === 'double' ? (
                /* ================= MODE 2 LOGO (MENGAPIT) ================= */
                <div className="flex items-center justify-between w-full mb-6 gap-2 pb-5 border-b border-slate-100">
                  
                  {/* Logo Kiri */}
                  <div className="w-1/4 flex justify-start items-center">
                    {logoLeft ? (
                      <img src={logoLeft} alt="Logo Left" className="h-20 w-auto max-w-[120px] object-contain print:h-20" />
                    ) : (
                      renderDefaultLogo('PINARAK')
                    )}
                  </div>
                  
                  {/* Teks Deskripsi Bisnis Tengah */}
                  <div className="w-2/4 text-center space-y-1">
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full text-center font-serif text-2xl font-extrabold tracking-tight bg-transparent focus:bg-slate-50 focus:outline-none px-1 border border-transparent hover:border-slate-200 rounded"
                      style={{ color: activeTheme.primary }}
                    />
                    <input
                      type="text"
                      value={businessManagement}
                      onChange={(e) => setBusinessManagement(e.target.value)}
                      className="w-full text-center text-[10px] font-bold tracking-widest uppercase bg-transparent focus:bg-slate-50 focus:outline-none p-0.5 border border-transparent hover:border-slate-200 rounded text-slate-500"
                    />
                    <div className="flex items-center justify-center gap-1.5 py-0.5">
                      <span className="h-[1px] w-6 bg-slate-200"></span>
                      <input
                        type="text"
                        value={businessTagline}
                        onChange={(e) => setBusinessTagline(e.target.value)}
                        className="text-[9px] font-semibold tracking-wide text-center bg-transparent focus:bg-slate-50 focus:outline-none p-0.5 border border-transparent hover:border-slate-200 rounded w-full"
                        style={{ color: activeTheme.secondary }}
                      />
                      <span className="h-[1px] w-6 bg-slate-200"></span>
                    </div>
                    <input
                      type="text"
                      value={businessLocation}
                      onChange={(e) => setBusinessLocation(e.target.value)}
                      className="w-full text-center text-[9px] font-bold text-slate-400 bg-transparent focus:bg-slate-50 focus:outline-none p-0.5"
                    />
                  </div>

                  {/* Logo Kanan */}
                  <div className="w-1/4 flex justify-end items-center">
                    {logoRight ? (
                      <img src={logoRight} alt="Logo Right" className="h-20 w-auto max-w-[120px] object-contain print:h-20" />
                    ) : (
                      renderDefaultLogo('MANAGEMENT')
                    )}
                  </div>

                </div>
              ) : (
                /* ================= MODE 1 LOGO (TENGAH) ================= */
                <div className="flex flex-col items-center text-center mb-6 pb-5 border-b border-slate-100">
                  <div className="mb-3">
                    {logoLeft ? (
                      <img src={logoLeft} alt="Logo Center" className="h-24 w-auto max-w-[200px] object-contain print:h-24" />
                    ) : (
                      renderDefaultLogo('PINARAK VILLA')
                    )}
                  </div>

                  <div className="space-y-1 w-full max-w-lg">
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full text-center font-serif text-3xl font-extrabold tracking-tight bg-transparent focus:bg-slate-50 focus:outline-none p-1 border border-transparent hover:border-slate-200 rounded"
                      style={{ color: activeTheme.primary }}
                    />
                    <input
                      type="text"
                      value={businessManagement}
                      onChange={(e) => setBusinessManagement(e.target.value)}
                      className="w-full text-center text-xs font-semibold tracking-wider uppercase bg-transparent focus:bg-slate-50 focus:outline-none p-0.5 border border-transparent hover:border-slate-200 rounded text-slate-500"
                    />
                    <div className="flex items-center justify-center gap-2 py-1">
                      <span className="h-[1px] w-12 bg-slate-200"></span>
                      <input
                        type="text"
                        value={businessTagline}
                        onChange={(e) => setBusinessTagline(e.target.value)}
                        className="text-[10px] font-medium tracking-wide text-center bg-transparent focus:bg-slate-50 focus:outline-none p-0.5 border border-transparent hover:border-slate-200 rounded max-w-sm"
                        style={{ color: activeTheme.secondary }}
                      />
                      <span className="h-[1px] w-12 bg-slate-200"></span>
                    </div>
                    <input
                      type="text"
                      value={businessLocation}
                      onChange={(e) => setBusinessLocation(e.target.value)}
                      className="w-full text-center text-[11px] font-semibold text-slate-400 bg-transparent focus:bg-slate-50 focus:outline-none p-0.5"
                    />
                  </div>
                </div>
              )}

              {/* JUDUL SELEMBAR INVOICE */}
              <div className="text-center py-2 mb-6 border-y border-slate-100 relative">
                <h2 className="text-xl font-bold tracking-widest text-slate-800">INVOICE</h2>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1" style={{ backgroundColor: activeTheme.primary }}></div>
              </div>

              {/* DATA TAMU & SPESIFIKASI RESERVASI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm text-slate-700">
                
                {/* Panel Kiri: Identitas Customer */}
                <div className="space-y-2 p-3.5 bg-slate-50/50 rounded-lg border border-slate-100">
                  <table className="w-full table-fixed">
                    <tbody>
                      <tr>
                        <td className="w-24 font-semibold text-slate-500 text-xs py-1">NAMA TAMU</td>
                        <td className="w-4 text-center text-slate-400">:</td>
                        <td className="py-1">
                          <input 
                            type="text" 
                            value={customerName} 
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full font-bold bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-200 rounded px-1 text-slate-800"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold text-slate-500 text-xs py-1">NO. HP</td>
                        <td className="text-center text-slate-400">:</td>
                        <td className="py-1">
                          <input 
                            type="text" 
                            value={customerPhone} 
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-200 rounded px-1"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold text-slate-500 text-xs py-1">CHECK-IN</td>
                        <td className="text-center text-slate-400">:</td>
                        <td className="py-1 font-semibold text-slate-800">
                          {new Date(checkInDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                          <span className="text-xs font-normal text-slate-500 ml-1">({checkInTime} WIB)</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold text-slate-500 text-xs py-1">CHECK-OUT</td>
                        <td className="text-center text-slate-400">:</td>
                        <td className="py-1 font-semibold text-slate-800">
                          {new Date(checkOutDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                          <span className="text-xs font-normal text-slate-500 ml-1">({checkOutTime} WIB)</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Panel Kanan: Kode / Informasi Tagihan */}
                <div className="space-y-2 p-3.5 bg-slate-50/50 rounded-lg border border-slate-100">
                  <table className="w-full table-fixed">
                    <tbody>
                      <tr>
                        <td className="w-32 font-semibold text-slate-500 text-xs py-1">NO. INVOICE</td>
                        <td className="w-4 text-center text-slate-400">:</td>
                        <td className="py-1">
                          <input 
                            type="text" 
                            value={invoiceNo} 
                            onChange={(e) => setInvoiceNo(e.target.value)}
                            className="w-full font-mono font-semibold bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-200 rounded px-1"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold text-slate-500 text-xs py-1">METODE BAYAR</td>
                        <td className="text-center text-slate-400">:</td>
                        <td className="py-1">
                          <input 
                            type="text" 
                            value={paymentMethod} 
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-200 rounded px-1"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold text-slate-500 text-xs py-1">DURASI SEWA</td>
                        <td className="text-center text-slate-400">:</td>
                        <td className="py-1 font-semibold text-slate-800">
                          {Math.max(1, Math.round((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)))} Malam
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold text-slate-500 text-xs py-1">STATUS RESERVASI</td>
                        <td className="text-center text-slate-400">:</td>
                        <td className="py-1">
                          <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded" style={{ backgroundColor: activeTheme.accent, color: activeTheme.primary }}>
                            RESERVED / CONFIRMED
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

              {/* DAFTAR VILLA / JASA LAYANAN */}
              <div className="mb-6 overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="font-bold text-white uppercase tracking-wider" style={{ backgroundColor: activeTheme.primary }}>
                      <th className="py-3 px-3 text-center w-12">No.</th>
                      <th className="py-3 px-4">Deskripsi Sewa / Layanan</th>
                      <th className="py-3 px-4 text-right w-32">Harga Satuan</th>
                      <th className="py-3 px-3 text-center w-16">Qty / Malam</th>
                      <th className="py-3 px-4 text-right w-36">Total Harga</th>
                      <th className="py-3 px-2 w-10 text-center print:hidden"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 group">
                        {/* Kolom Nomor */}
                        <td className="py-2.5 px-3 text-center font-medium text-slate-500">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        
                        {/* Kolom Nama Item */}
                        <td className="py-2.5 px-4">
                          <input 
                            type="text" 
                            value={item.name} 
                            onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                            className="w-full font-semibold bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-200 rounded px-1.5 py-1 text-slate-800 text-xs"
                          />
                        </td>
                        
                        {/* Kolom Harga */}
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-slate-400">Rp</span>
                            <input 
                              type="number" 
                              value={item.price} 
                              onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                              className="w-24 text-right font-medium bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-200 rounded px-1 py-1 text-xs"
                            />
                          </div>
                        </td>
                        
                        {/* Kolom Kuantitas */}
                        <td className="py-2.5 px-3 text-center">
                          <input 
                            type="number" 
                            value={item.qty} 
                            min="1"
                            onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                            className="w-10 text-center font-bold bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-200 rounded py-1 text-xs"
                          />
                        </td>
                        
                        {/* Kolom Total Item */}
                        <td className="py-2.5 px-4 text-right font-bold text-slate-800">
                          {formatRupiah(item.price * item.qty)}
                        </td>

                        {/* Tombol Hapus Baris (Sembunyi ketika dicetak) */}
                        <td className="py-2.5 px-2 text-center print:hidden">
                          <button 
                            onClick={() => deleteItem(item.id)}
                            className="text-red-400 hover:text-red-600 transition p-1 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100"
                            title="Hapus baris"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Tombol Sisip Item Baru (Sembunyi ketika dicetak) */}
                    <tr className="print:hidden bg-slate-50/50">
                      <td colSpan="6" className="p-2">
                        <button
                          onClick={() => addItem()}
                          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-dashed border-slate-300 hover:border-slate-400 rounded-lg transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Tambah Baris Baru / Layanan Extra
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* PANEL SUMMARY & INFORMASI DETAIL */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Blok Kiri: Data Bank & Aturan Catatan */}
                <div className="md:col-span-7 space-y-4 text-slate-700">
                  
                  {/* Rekening Pembayaran */}
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                    <span className="block text-[11px] font-bold tracking-wider uppercase mb-2 text-slate-500">Informasi Pembayaran</span>
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="w-24 text-slate-500 font-medium py-1">Nama Bank</td>
                          <td className="w-4 text-center">:</td>
                          <td className="font-bold py-1 text-slate-800">{bankName}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="text-slate-500 font-medium py-1">No. Rekening</td>
                          <td className="text-center">:</td>
                          <td className="font-mono font-bold text-sm py-1 text-slate-800">{bankNumber}</td>
                        </tr>
                        <tr>
                          <td className="text-slate-500 font-medium py-1">Atas Nama</td>
                          <td className="text-center">:</td>
                          <td className="font-semibold py-1 text-slate-800">{bankHolder}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Kebijakan Term */}
                  <div>
                    <span className="block text-[11px] font-bold tracking-wider uppercase mb-1.5 text-slate-500">Syarat & Ketentuan (Catatan)</span>
                    <ul className="text-[11px] space-y-1 text-slate-500 list-disc list-inside">
                      {notes.map((note, index) => (
                        <li key={index} className="leading-relaxed">
                          <span className="font-medium text-slate-600">{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Blok Kanan: Rincian Keuangan */}
                <div className="md:col-span-5 p-4 rounded-xl border-2 text-xs space-y-3" style={{ borderColor: activeTheme.primary, backgroundColor: activeTheme.accent + '20' }}>
                  
                  {/* Subtotal */}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-600">Subtotal</span>
                    <span className="font-bold text-slate-800">{formatRupiah(subtotal)}</span>
                  </div>

                  {/* Down Payment */}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-600">
                      DP (Down Payment)
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Rp</span>
                      <input 
                        type="number" 
                        value={dpValue} 
                        onChange={(e) => setDpValue(Number(e.target.value))}
                        className="w-20 text-right font-bold bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-300 rounded p-0.5"
                      />
                    </div>
                  </div>

                  {/* Diskon / Potongan */}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-600">
                      Diskon / Potongan
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Rp</span>
                      <input 
                        type="number" 
                        value={discountValue} 
                        onChange={(e) => setDiscountValue(Number(e.target.value))}
                        className="w-20 text-right font-bold bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-300 rounded p-0.5 text-red-700"
                      />
                    </div>
                  </div>

                  {/* Sisa Tagihan */}
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-bold text-sm text-slate-800">Total Tagihan (Sisa)</span>
                    <span className="font-extrabold text-base tracking-tight" style={{ color: activeTheme.primary }}>
                      {formatRupiah(totalBill)}
                    </span>
                  </div>

                </div>

              </div>

            </div>

            {/* BANNER BAWAH / STATUS KETENTUAN */}
            <div className="mt-8 border-t pt-4">
              
              {/* Box Info Pelunasan */}
              <div className="text-center py-2.5 rounded mb-3 font-extrabold tracking-wide text-xs" style={{ backgroundColor: activeTheme.primary, color: '#ffffff' }}>
                <input 
                  type="text" 
                  value={footerBannerText} 
                  onChange={(e) => setFooterBannerText(e.target.value)}
                  className="w-full text-center bg-transparent text-white font-extrabold border-none outline-none focus:ring-0 cursor-text"
                />
              </div>

              {/* Keterangan Aturan Waktu Check-in/Out */}
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Check-in: {checkInTime} WIB</span>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeTheme.secondary }}></span>
                <span>Pinarak Villa Management</span>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeTheme.secondary }}></span>
                <span>Check-out: {checkOutTime} WIB</span>
              </div>

            </div>

          </div>

          <div className="text-slate-400 text-[11px] text-center mt-3 print:hidden max-w-lg">
            Tekan opsi <span className="font-semibold">"Unduh PDF Langsung"</span> untuk pemrosesan super cepat tanpa hambatan.
          </div>

        </section>

      </main>

      {/* FOOTER APLIKASI */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 text-center mt-8 border-t border-slate-800 print:hidden">
        <p>© 2026 Pinarak Villa Management. All rights reserved.</p>
        <p className="text-[10px] mt-1 text-slate-500">Aplikasi pembuat invoice profesional dirancang ramah cetak dan responsif.</p>
      </footer>

      {/* CSS Cetak */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #invoice-capture-area {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: auto !important;
          }
          input {
            border: none !important;
            background-color: transparent !important;
            padding: 0 !important;
          }
          input[type=number]::-webkit-inner-spin-button, 
          input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

    </div>
  );
}