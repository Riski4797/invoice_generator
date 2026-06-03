import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Printer, 
  Download, 
  Settings, 
  Palette, 
  FileText,
  User,
  HelpCircle,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Laptop,
  History,
  Save,
  FolderOpen,
  FilePlus
} from 'lucide-react';

// TypeScript Declarations for Electron IPC
declare global {
  interface Window {
    electronAPI?: {
      print: () => void;
      printToPDF: (defaultFileName: string) => Promise<{
        success: boolean;
        cancelled?: boolean;
        filePath?: string;
        error?: string;
      }>;
      openExternal?: (url: string) => void;
      downloadUpdate?: (url: string, browserDownloadUrl: string, token?: string) => Promise<{ success: boolean; error?: string }>;
      onDownloadProgress?: (callback: (percent: number) => void) => () => void;
    };
  }
}

interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  text: string;
  border: string;
}



interface Item {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface SavedInvoice {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerPhone: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  items: Item[];
  dpValue: number;
  discountValue: number;
  paymentMethod: string;
  createdAt: string;
}

export default function App() {
  // Pilihan Tema Warna Premium
  const themes: Theme[] = [
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



  // --- States with LocalStorage Persistence ---
  
  // Theme state
  const [activeTheme, setActiveTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('pinarak_theme');
    if (saved) {
      const parsed = JSON.parse(saved);
      const match = themes.find(t => t.id === parsed.id);
      if (match) return match;
    }
    return themes[0];
  });

  // Business Identity details
  const [businessName, setBusinessName] = useState(() => localStorage.getItem('pinarak_businessName') || 'PINARAK VILLA');
  const [businessManagement, setBusinessManagement] = useState(() => localStorage.getItem('pinarak_businessManagement') || 'PINARAK VILLA MANAGEMENT');
  const [businessTagline, setBusinessTagline] = useState(() => localStorage.getItem('pinarak_businessTagline') || 'SEWA VILLA NYAMAN — TERLENGKAP DI KOTA WISATA BATU');
  const [businessLocation, setBusinessLocation] = useState(() => localStorage.getItem('pinarak_businessLocation') || 'KOTA BATU • JAWA TIMUR • INDONESIA');

  // Logo Settings
  const [logoMode, setLogoMode] = useState(() => localStorage.getItem('pinarak_logoMode') || 'double');
  const [logoLeft, setLogoLeft] = useState<string | null>(() => localStorage.getItem('pinarak_logoLeft') || null);
  const [logoRight, setLogoRight] = useState<string | null>(() => localStorage.getItem('pinarak_logoRight') || null);
  const [useSameLogo, setUseSameLogo] = useState<boolean>(() => {
    const saved = localStorage.getItem('pinarak_useSameLogo');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Bank Info details
  const [bankName, setBankName] = useState(() => localStorage.getItem('pinarak_bankName') || 'BCA (Bank Central Asia)');
  const [bankNumber, setBankNumber] = useState(() => localStorage.getItem('pinarak_bankNumber') || '816-091-XXXX');
  const [bankHolder, setBankHolder] = useState(() => localStorage.getItem('pinarak_bankHolder') || 'Ivan Adiluhung');

  // Custom policies notes
  const [notes, setNotes] = useState<string[]>(() => {
    const saved = localStorage.getItem('pinarak_notes');
    return saved ? JSON.parse(saved) : [
      'DP tidak dapat direfund jika ada pembatalan sepihak.',
      'Reschedule diperbolehkan maksimal 1x (paling lambat H-14 check-in).'
    ];
  });

  const [footerBannerText, setFooterBannerText] = useState(() => localStorage.getItem('pinarak_footerBannerText') || 'PELUNASAN WAJIB H-1 SEBELUM CHECK-IN');

  // --- States for History & Drafts ---
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>(() => {
    const saved = localStorage.getItem('pinarak_savedInvoices');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(() => {
    return localStorage.getItem('pinarak_activeInvoiceId') || null;
  });

  // Transactional details with draft persistence (fallback to defaults if no draft)
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('pinarak_draft_customerName') || 'Bpk. Budi Sentosa');
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('pinarak_draft_customerPhone') || '0812-3456-7890');
  const [invoiceNo, setInvoiceNo] = useState(() => localStorage.getItem('pinarak_draft_invoiceNo') || `INV/${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}/012`);
  const [paymentMethod, setPaymentMethod] = useState(() => localStorage.getItem('pinarak_draft_paymentMethod') || 'Transfer BCA');

  const [checkInDate, setCheckInDate] = useState(() => localStorage.getItem('pinarak_draft_checkInDate') || '2026-06-15');
  const [checkInTime, setCheckInTime] = useState(() => localStorage.getItem('pinarak_draft_checkInTime') || '14:00');
  const [checkOutDate, setCheckOutDate] = useState(() => localStorage.getItem('pinarak_draft_checkOutDate') || '2026-06-17');
  const [checkOutTime, setCheckOutTime] = useState(() => localStorage.getItem('pinarak_draft_checkOutTime') || '11:00');

  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem('pinarak_draft_items');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Pinarak Villa Premium (Private Pool & Jacuzzi)', price: 3500000, qty: 2 },
      { id: '2', name: 'Extra Bed Premium Set', price: 150000, qty: 2 },
      { id: '3', name: 'Sewa Alat BBQ Arang Set', price: 250000, qty: 1 }
    ];
  });

  const [dpValue, setDpValue] = useState(() => {
    const saved = localStorage.getItem('pinarak_draft_dpValue');
    return saved !== null ? Number(saved) : 1500000;
  });
  const [discountValue, setDiscountValue] = useState(() => {
    const saved = localStorage.getItem('pinarak_draft_discountValue');
    return saved !== null ? Number(saved) : 200000;
  });

  const [newNote, setNewNote] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // --- Update Checker States ---
  const [githubRepoUrl, setGithubRepoUrl] = useState(() => localStorage.getItem('pinarak_githubRepoUrl') || 'https://github.com/Riski4797/invoice_generator');
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('pinarak_githubToken') || '');
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'latest' | 'available' | 'error'>('idle');
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [updateAssetUrl, setUpdateAssetUrl] = useState<string | null>(null);
  const [updateBrowserUrl, setUpdateBrowserUrl] = useState<string | null>(null);
  const [isDownloadingUpdate, setIsDownloadingUpdate] = useState<boolean>(false);
  const [downloadPercent, setDownloadPercent] = useState<number>(0);

  // --- Spacing Spacers & Compactness States ---
  const [autoFitSpacing, setAutoFitSpacing] = useState<boolean>(() => {
    const saved = localStorage.getItem('pinarak_autoFitSpacing');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [manualSpacingMode, setManualSpacingMode] = useState<'standard' | 'compact' | 'super-compact'>(() => {
    return (localStorage.getItem('pinarak_manualSpacingMode') as 'standard' | 'compact' | 'super-compact') || 'standard';
  });

  // --- Effects to Auto-save Configuration Variables ---
  useEffect(() => {
    localStorage.setItem('pinarak_savedInvoices', JSON.stringify(savedInvoices));
  }, [savedInvoices]);

  useEffect(() => {
    localStorage.setItem('pinarak_activeInvoiceId', activeInvoiceId || '');
  }, [activeInvoiceId]);

  useEffect(() => {
    localStorage.setItem('pinarak_draft_customerName', customerName);
    localStorage.setItem('pinarak_draft_customerPhone', customerPhone);
    localStorage.setItem('pinarak_draft_invoiceNo', invoiceNo);
    localStorage.setItem('pinarak_draft_paymentMethod', paymentMethod);
    localStorage.setItem('pinarak_draft_checkInDate', checkInDate);
    localStorage.setItem('pinarak_draft_checkInTime', checkInTime);
    localStorage.setItem('pinarak_draft_checkOutDate', checkOutDate);
    localStorage.setItem('pinarak_draft_checkOutTime', checkOutTime);
    localStorage.setItem('pinarak_draft_items', JSON.stringify(items));
    localStorage.setItem('pinarak_draft_dpValue', String(dpValue));
    localStorage.setItem('pinarak_draft_discountValue', String(discountValue));
  }, [customerName, customerPhone, invoiceNo, paymentMethod, checkInDate, checkInTime, checkOutDate, checkOutTime, items, dpValue, discountValue]);

  useEffect(() => {
    localStorage.setItem('pinarak_theme', JSON.stringify(activeTheme));
  }, [activeTheme]);

  useEffect(() => {
    localStorage.setItem('pinarak_businessName', businessName);
    localStorage.setItem('pinarak_businessManagement', businessManagement);
    localStorage.setItem('pinarak_businessTagline', businessTagline);
    localStorage.setItem('pinarak_businessLocation', businessLocation);
  }, [businessName, businessManagement, businessTagline, businessLocation]);

  useEffect(() => {
    localStorage.setItem('pinarak_logoMode', logoMode);
    localStorage.setItem('pinarak_logoLeft', logoLeft || '');
    localStorage.setItem('pinarak_logoRight', logoRight || '');
    localStorage.setItem('pinarak_useSameLogo', JSON.stringify(useSameLogo));
  }, [logoMode, logoLeft, logoRight, useSameLogo]);

  useEffect(() => {
    localStorage.setItem('pinarak_bankName', bankName);
    localStorage.setItem('pinarak_bankNumber', bankNumber);
    localStorage.setItem('pinarak_bankHolder', bankHolder);
  }, [bankName, bankNumber, bankHolder]);

  useEffect(() => {
    localStorage.setItem('pinarak_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('pinarak_footerBannerText', footerBannerText);
  }, [footerBannerText]);

  useEffect(() => {
    localStorage.setItem('pinarak_autoFitSpacing', JSON.stringify(autoFitSpacing));
  }, [autoFitSpacing]);

  useEffect(() => {
    localStorage.setItem('pinarak_manualSpacingMode', manualSpacingMode);
  }, [manualSpacingMode]);

  useEffect(() => {
    localStorage.setItem('pinarak_githubRepoUrl', githubRepoUrl);
  }, [githubRepoUrl]);

  useEffect(() => {
    localStorage.setItem('pinarak_githubToken', githubToken);
  }, [githubToken]);

  // Compute final compactness spacing mode
  const getCompactnessMode = (): 'standard' | 'compact' | 'super-compact' => {
    if (!autoFitSpacing) return manualSpacingMode;
    const itemsCount = items.length;
    const notesCount = notes.length;
    
    if (itemsCount >= 5 || (itemsCount >= 4 && notesCount >= 3)) {
      return 'super-compact';
    } else if (itemsCount >= 4 || notesCount >= 3) {
      return 'compact';
    }
    return 'standard';
  };

  const spacingMode = getCompactnessMode();

  // Helper classes for responsive A4 spacing to force 1-page fit
  const spacingStyles = {
    kop: {
      standard: 'mb-3 pb-2',
      compact: 'mb-2.5 pb-1.5',
      'super-compact': 'mb-2 pb-1'
    },
    logoDouble: {
      standard: 'h-20 max-w-[120px]',
      compact: 'h-16 max-w-[100px]',
      'super-compact': 'h-12 max-w-[80px]'
    },
    logoSingle: {
      standard: 'h-24 max-w-[200px]',
      compact: 'h-18 max-w-[150px]',
      'super-compact': 'h-13 max-w-[110px]'
    },
    brandText: {
      standard: 'text-2xl font-extrabold',
      compact: 'text-xl font-extrabold',
      'super-compact': 'text-base font-extrabold'
    },
    brandSubText: {
      standard: 'text-[10px]',
      compact: 'text-[9px]',
      'super-compact': 'text-[8px]'
    },
    brandTagline: {
      standard: 'text-[9px]',
      compact: 'text-[8px]',
      'super-compact': 'text-[7px]'
    },
    title: {
      standard: 'mb-3 py-1',
      compact: 'mb-2 py-0.5',
      'super-compact': 'mb-1.5 py-0.5'
    },
    reservation: {
      standard: 'mb-3 gap-2.5 p-2.5',
      compact: 'mb-2.5 gap-2 p-2',
      'super-compact': 'mb-1.5 gap-1 p-1'
    },
    reservationTd: {
      standard: 'py-0.5 text-sm',
      compact: 'py-0.5 text-xs',
      'super-compact': 'py-0 text-[10px]'
    },
    tableMargin: {
      standard: 'mb-3',
      compact: 'mb-2.5',
      'super-compact': 'mb-1.5'
    },
    tableTh: {
      standard: 'py-2.5 px-3 text-xs',
      compact: 'py-1.5 px-2.5 text-xs',
      'super-compact': 'py-1 px-1.5 text-[10px]'
    },
    tableTd: {
      standard: 'py-2 px-3 text-xs',
      compact: 'py-1.5 px-2.5 text-xs',
      'super-compact': 'py-0.5 px-1.5 text-[10px]'
    },
    summaryGrid: {
      standard: 'gap-4',
      compact: 'gap-3',
      'super-compact': 'gap-2'
    },
    financialBox: {
      standard: 'p-3 space-y-2.5 text-xs',
      compact: 'p-2.5 space-y-1.5 text-xs',
      'super-compact': 'p-1.5 space-y-0.5 text-[10px]'
    },
    bankBox: {
      standard: 'p-3 bg-slate-50/50 space-y-1',
      compact: 'p-2 bg-slate-50/50 space-y-0.5',
      'super-compact': 'p-1.5 bg-slate-50/50 space-y-0'
    },
    footerBanner: {
      standard: 'mt-4 pt-2',
      compact: 'mt-3 pt-1.5',
      'super-compact': 'mt-1.5 pt-0.5'
    }
  };

  // Synchronize logoRight with logoLeft if same-logo configuration is active
  useEffect(() => {
    if (useSameLogo && logoLeft) {
      setLogoRight(logoLeft);
    }
  }, [logoLeft, useSameLogo]);

  // Toast Notification handler
  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Convert numbers to Rupiah currency format
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  // Financial calculations
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalBill = subtotal - dpValue - discountValue;

  // Custom logo upload handlers
  const handleLogoLeftUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoLeft(result);
        if (useSameLogo) {
          setLogoRight(result);
        }
        triggerToast('Logo Kiri berhasil diunggah!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoRightUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoRight(reader.result as string);
        triggerToast('Logo Kanan berhasil diunggah!');
      };
      reader.readAsDataURL(file);
    }
  };

  const resetLogos = () => {
    setLogoLeft(null);
    setLogoRight(null);
    triggerToast('Semua logo kustom telah dihapus.', 'info');
  };

  const handleItemChange = (id: string, field: keyof Item, value: string | number) => {
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
    const newItem: Item = {
      id: Date.now().toString(),
      name: name || 'Nama Villa / Layanan Baru',
      price: price || 0,
      qty: 1
    };
    setItems([...items, newItem]);
    triggerToast('Item baru berhasil ditambahkan');
  };

  const deleteItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
      triggerToast('Item berhasil dihapus', 'info');
    } else {
      triggerToast('Harus menyisakan minimal 1 baris item!', 'error');
    }
  };

  const handleAddNote = () => {
    if (newNote.trim() !== '') {
      setNotes([...notes, newNote.trim()]);
      setNewNote('');
      triggerToast('Catatan kebijakan ditambahkan');
    }
  };

  const removeNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
    triggerToast('Catatan kebijakan dihapus', 'info');
  };

  // --- PDF Export Logic ---
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const sanitizedCustomer = customerName.replace(/[^a-zA-Z0-9]/g, '_');
    const sanitizedInvoice = invoiceNo.replace(/[^a-zA-Z0-9]/g, '_');
    const defaultFileName = `Invoice_${sanitizedCustomer}_${sanitizedInvoice}.pdf`;

    // 1. Electron Native Path
    if (window.electronAPI) {
      triggerToast('Membuka penjelajah berkas untuk menyimpan PDF...', 'info');
      try {
        const result = await window.electronAPI.printToPDF(defaultFileName);
        setIsDownloading(false);
        if (result.success) {
          triggerToast(`PDF Berhasil Disimpan!`, 'success');
        } else if (result.cancelled) {
          triggerToast('Ekspor PDF dibatalkan oleh pengguna.', 'info');
        } else {
          triggerToast(`Gagal mengekspor PDF: ${result.error}`, 'error');
        }
      } catch (err: any) {
        setIsDownloading(false);
        console.error(err);
        triggerToast('Gagal memproses ekspor PDF.', 'error');
      }
    } 
    // 2. Web Browser Fallback Path
    else {
      triggerToast('Sedang mempersiapkan rendering file PDF...', 'info');

      const element = document.getElementById('invoice-capture-area');
      if (!element) {
        setIsDownloading(false);
        triggerToast('Elemen area cetak tidak ditemukan.', 'error');
        return;
      }
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: defaultFileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2.2,
          useCORS: true,
          logging: false,
          letterRendering: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const runPdfConverter = () => {
        // @ts-ignore
        window.html2pdf()
          .from(element)
          .set(opt)
          .save()
          .then(() => {
            setIsDownloading(false);
            triggerToast('PDF Berhasil Diunduh!');
          })
          .catch((err: any) => {
            console.error(err);
            setIsDownloading(false);
            triggerToast('Terjadi kesalahan saat memproses ekspor PDF.', 'error');
          });
      };

      // @ts-ignore
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
    }
  };

  // --- Printing Logic ---
  const triggerPrint = () => {
    triggerToast('Membuka dialog cetak sistem...', 'info');
    setTimeout(() => {
      if (window.electronAPI) {
        window.electronAPI.print();
      } else {
        window.print();
      }
    }, 400);
  };

  // --- Update Checker Logic ---
  const CURRENT_VERSION = '1.1.0';

  const isNewerVersion = (current: string, remote: string) => {
    const curParts = current.split('.').map(Number);
    const remParts = remote.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      const curVal = curParts[i] || 0;
      const remVal = remParts[i] || 0;
      if (remVal > curVal) return true;
      if (remVal < curVal) return false;
    }
    return false;
  };

  const processUpdateData = (data: any, silent: boolean) => {
    const remoteVersion = data.version;
    setLatestVersion(remoteVersion);

    if (isNewerVersion(CURRENT_VERSION, remoteVersion)) {
      setUpdateStatus('available');
      setShowUpdateModal(true);
      triggerToast(`Pembaruan tersedia! Versi terbaru: v${remoteVersion}`, 'success');
    } else {
      setUpdateStatus('latest');
      if (!silent) triggerToast('Aplikasi Anda sudah menggunakan versi terbaru.', 'success');
    }
  };

  const checkUpdates = async (silent = true) => {
    if (!githubRepoUrl) {
      if (!silent) triggerToast('Atur URL repositori GitHub di panel bawah sidebar.', 'error');
      return;
    }

    const match = githubRepoUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
    if (!match) {
      if (!silent) triggerToast('Format URL GitHub tidak valid.', 'error');
      return;
    }

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '');

    setUpdateStatus('checking');
    if (!silent) triggerToast('Memeriksa pembaruan...', 'info');

    try {
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json'
      };
      if (githubToken) {
        headers['Authorization'] = `token ${githubToken}`;
      }

      // Try fetching the latest release first via GitHub Release API (gives download assets links directly)
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, { headers });
      if (response.ok) {
        const releaseData = await response.json();
        const remoteVersion = releaseData.tag_name.replace(/^v/, '');
        setLatestVersion(remoteVersion);

        const exeAsset = releaseData.assets?.find((asset: any) => asset.name.endsWith('.exe'));
        if (exeAsset) {
          setUpdateAssetUrl(exeAsset.url);
          setUpdateBrowserUrl(exeAsset.browser_download_url);
        }

        if (isNewerVersion(CURRENT_VERSION, remoteVersion)) {
          setUpdateStatus('available');
          setShowUpdateModal(true);
          triggerToast(`Pembaruan tersedia! Versi terbaru: v${remoteVersion}`, 'success');
        } else {
          setUpdateStatus('latest');
          if (!silent) triggerToast('Aplikasi Anda sudah menggunakan versi terbaru.', 'success');
        }
        return;
      }
      
      // Fallback: If releases endpoint fails (e.g. no releases on repo yet), check raw package.json contents
      const rawHeaders: HeadersInit = { 'Accept': 'application/vnd.github.v3.raw' };
      if (githubToken) rawHeaders['Authorization'] = `token ${githubToken}`;
      
      let contentsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json?ref=main`, { headers: rawHeaders });
      if (!contentsResponse.ok) {
        contentsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json?ref=master`, { headers: rawHeaders });
        if (!contentsResponse.ok) {
          const rawResponse = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/package.json`);
          if (!rawResponse.ok) {
            const rawFbResponse = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/package.json`);
            if (!rawFbResponse.ok) throw new Error('Gagal mengunduh metadata rilis.');
            const data = await rawFbResponse.json();
            processUpdateData(data, silent);
            return;
          } else {
            const data = await rawResponse.json();
            processUpdateData(data, silent);
            return;
          }
        }
      }
      const data = await contentsResponse.json();
      processUpdateData(data, silent);
    } catch (error) {
      console.error('Update check failed:', error);
      setUpdateStatus('error');
      if (!silent) triggerToast('Gagal memeriksa pembaruan. Pastikan token, URL & internet aktif.', 'error');
    }
  };

  const handleStartUpdate = async () => {
    if (!window.electronAPI?.onDownloadProgress || !window.electronAPI?.downloadUpdate || !updateAssetUrl || !updateBrowserUrl) {
      // Browser fallback (open releases URL)
      const downloadUrl = githubRepoUrl.endsWith('/releases') ? githubRepoUrl : `${githubRepoUrl}/releases`;
      if (window.electronAPI?.openExternal) {
        window.electronAPI.openExternal(downloadUrl);
      } else {
        window.open(downloadUrl, '_blank');
      }
      return;
    }

    setIsDownloadingUpdate(true);
    setDownloadPercent(0);

    // Subscribe to progress events from native thread
    const unsubscribe = window.electronAPI.onDownloadProgress((percent: number) => {
      setDownloadPercent(percent);
    });

    try {
      const result = await window.electronAPI.downloadUpdate(
        updateAssetUrl,
        updateBrowserUrl,
        githubToken || undefined
      );

      if (result && !result.success) {
        unsubscribe();
        setIsDownloadingUpdate(false);
        triggerToast(`Gagal mengunduh pembaruan: ${result.error}`, 'error');
      }
    } catch (error: any) {
      unsubscribe();
      setIsDownloadingUpdate(false);
      triggerToast(`Eror saat melakukan pembaruan: ${error.message || error}`, 'error');
    }
  };

  // Check silently on startup if repository URL is set
  useEffect(() => {
    const savedUrl = localStorage.getItem('pinarak_githubRepoUrl');
    if (savedUrl) {
      setTimeout(() => {
        checkUpdates(true);
      }, 1500); // Slight delay after mount to avoid interfering with load animations
    }
  }, []);

  // --- Handlers for Invoice History (Riwayat Invoice) ---
  const handleNewInvoice = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const seq = String(savedInvoices.length + 1).padStart(3, '0');
    
    setInvoiceNo(`INV/${year}${month}/${seq}`);
    setCustomerName('Bpk. Budi Sentosa');
    setCustomerPhone('0812-3456-7890');
    setPaymentMethod('Transfer BCA');
    setCheckInDate('2026-06-15');
    setCheckInTime('14:00');
    setCheckOutDate('2026-06-17');
    setCheckOutTime('11:00');
    setItems([
      { id: '1', name: 'Pinarak Villa Premium (Private Pool & Jacuzzi)', price: 3500000, qty: 2 },
      { id: '2', name: 'Extra Bed Premium Set', price: 150000, qty: 2 },
      { id: '3', name: 'Sewa Alat BBQ Arang Set', price: 250000, qty: 1 }
    ]);
    setDpValue(1500000);
    setDiscountValue(200000);
    setActiveInvoiceId(null);
    triggerToast('Form baru telah disiapkan.', 'info');
  };

  const handleSaveInvoice = () => {
    if (!invoiceNo.trim()) {
      triggerToast('Nomor invoice tidak boleh kosong!', 'error');
      return;
    }

    const timestamp = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const invoiceData: SavedInvoice = {
      id: activeInvoiceId || Date.now().toString(),
      invoiceNo,
      customerName,
      customerPhone,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      items,
      dpValue,
      discountValue,
      paymentMethod,
      createdAt: timestamp
    };

    if (activeInvoiceId) {
      setSavedInvoices(prev => prev.map(inv => inv.id === activeInvoiceId ? invoiceData : inv));
      triggerToast('Invoice berhasil diperbarui!');
    } else {
      setSavedInvoices(prev => [invoiceData, ...prev]);
      setActiveInvoiceId(invoiceData.id);
      triggerToast('Invoice baru disimpan ke riwayat!');
    }
  };

  const handleLoadInvoice = (inv: SavedInvoice) => {
    setInvoiceNo(inv.invoiceNo);
    setCustomerName(inv.customerName);
    setCustomerPhone(inv.customerPhone);
    setCheckInDate(inv.checkInDate);
    setCheckInTime(inv.checkInTime);
    setCheckOutDate(inv.checkOutDate);
    setCheckOutTime(inv.checkOutTime);
    setItems(inv.items);
    setDpValue(inv.dpValue);
    setDiscountValue(inv.discountValue);
    setPaymentMethod(inv.paymentMethod);
    setActiveInvoiceId(inv.id);
    triggerToast(`Invoice ${inv.invoiceNo} berhasil dimuat!`);
  };

  const handleDeleteInvoice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Apakah Anda yakin ingin menghapus invoice ini dari riwayat?')) {
      setSavedInvoices(prev => prev.filter(inv => inv.id !== id));
      if (activeInvoiceId === id) {
        setActiveInvoiceId(null);
      }
      triggerToast('Invoice dihapus dari riwayat.', 'info');
    }
  };

  // Elegant Default SVG Logo Generator
  const renderDefaultLogo = (sideText: string) => (
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
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-2xl border border-slate-200 bg-white text-slate-800 transition-all transform animate-bounce print-hidden">
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
          {toast.type === 'info' && <Sparkles className="w-5 h-5 text-indigo-600" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Modal Pembaruan Aplikasi (Github Release) */}
      {showUpdateModal && latestVersion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print-hidden">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 p-6 transform transition-all scale-100 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100 text-amber-600">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Pembaruan Tersedia!</h3>
                <p className="text-[10px] text-slate-500 font-medium">Versi Baru: v{latestVersion} • Versi Anda: v{CURRENT_VERSION}</p>
              </div>
            </div>
            
            {isDownloadingUpdate ? (
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
                  <span>Mengunduh File Installer...</span>
                  <span className="font-mono text-emerald-600">{downloadPercent}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-emerald-600 transition-all duration-150 rounded-full" 
                    style={{ width: `${downloadPercent}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2.5 italic text-center">
                  {downloadPercent === 100 ? 'Hampir selesai, menutup aplikasi dan meluncurkan installer...' : 'Mohon jangan menutup aplikasi selama proses unduhan.'}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Versi terbaru **v{latestVersion}** telah dirilis di repositori GitHub Anda. Silakan klik "Perbarui Otomatis" untuk mengunduh dan memasang versi terbaru secara instan.
              </p>
            )}

            {!isDownloadingUpdate && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartUpdate}
                  className="flex-[2] flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md transition duration-150"
                >
                  <Download className="w-4 h-4" />
                  Perbarui Otomatis
                </button>
                <button
                  onClick={() => {
                    const downloadUrl = githubRepoUrl.endsWith('/releases') ? githubRepoUrl : `${githubRepoUrl}/releases`;
                    if (window.electronAPI?.openExternal) {
                      window.electronAPI.openExternal(downloadUrl);
                    } else {
                      window.open(downloadUrl, '_blank');
                    }
                  }}
                  className="flex-1 flex items-center justify-center bg-slate-150 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] py-2.5 px-2 rounded-xl transition duration-150"
                  title="Unduh manual lewat browser"
                >
                  Unduh Manual
                </button>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] py-2.5 px-2 rounded-xl transition duration-150"
                >
                  Nanti Saja
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header UI Aplikasi (Sembunyikan saat cetak) */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-10 shadow-sm print-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-800 tracking-tight">Pinarak Villa Invoice Generator</h1>
                <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-slate-100 border border-slate-200 rounded-full text-slate-500">
                  <Laptop className="w-3 h-3" /> Desktop App (Auto-save)
                </span>
              </div>
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
              {isDownloading ? 'Mengunduh PDF...' : 'Simpan sebagai PDF'}
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
        <section className="lg:col-span-4 space-y-6 print-hidden">
          
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

          {/* Optimasi Spasi Halaman (Auto-fit) */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-slate-500" />
              Optimasi Spasi 1 Halaman
            </h2>
            <div className="space-y-4">
              {/* Toggle Auto-fit */}
              <div className="flex items-center justify-between py-1 bg-slate-50 px-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-xs font-semibold text-slate-700 block">Muatkan 1 Halaman Otomatis</span>
                  <span className="text-[10px] text-slate-500 block">Sangat direkomendasikan untuk F4/A4</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={autoFitSpacing}
                  onChange={(e) => {
                    setAutoFitSpacing(e.target.checked);
                    triggerToast(e.target.checked ? 'Auto-fit halaman aktif' : 'Manual spacing diaktifkan');
                  }}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Status & Preview Mode */}
              <div className="text-xs text-slate-600 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-[11px] text-emerald-800">Status Halaman Saat Ini:</span>
                  <span className="block text-[10px] mt-0.5">
                    {autoFitSpacing 
                      ? `Auto-fit: Aktif (Mode: ${spacingMode.toUpperCase()})`
                      : `Manual: ${manualSpacingMode.toUpperCase()}`
                    }
                  </span>
                  <p className="text-[9px] text-slate-400 mt-1">
                    {spacingMode === 'standard' && "Kepadatan standar cocok untuk 1-3 item sewa."}
                    {spacingMode === 'compact' && "Kepadatan sedang diaktifkan otomatis agar muat 1 halaman."}
                    {spacingMode === 'super-compact' && "Kepadatan tinggi diaktifkan otomatis karena banyaknya data."}
                  </p>
                </div>
              </div>

              {/* Manual Spacing buttons (Enabled only if autoFitSpacing is false) */}
              {!autoFitSpacing && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="block text-[11px] font-semibold text-slate-600">Kepadatan Spasi Manual</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['standard', 'compact', 'super-compact'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setManualSpacingMode(mode);
                          triggerToast(`Spasi manual diatur ke ${mode}`);
                        }}
                        className={`py-1.5 px-1 rounded text-[10px] font-bold text-center border transition ${
                          manualSpacingMode === mode 
                            ? 'border-slate-800 bg-slate-50 ring-1 ring-slate-800 text-slate-900' 
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {mode === 'standard' && 'Standard'}
                        {mode === 'compact' && 'Compact'}
                        {mode === 'super-compact' && 'Super'}
                      </button>
                    ))}
                  </div>
                </div>
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

          {/* Riwayat Invoice Widget */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                Riwayat Invoice
              </h2>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                {savedInvoices.length} Tersimpan
              </span>
            </div>
            
            <div className="space-y-4">
              {/* Form Baru & Simpan Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleNewInvoice}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
                  title="Bersihkan form dan buat invoice baru"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  Form Baru
                </button>
                <button
                  onClick={handleSaveInvoice}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-sm"
                  title="Simpan draf aktif ke riwayat"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan Invoice
                </button>
              </div>

              {/* History List */}
              {savedInvoices.length === 0 ? (
                <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  <p className="text-xs font-medium">Belum ada riwayat invoice</p>
                  <p className="text-[10px] mt-0.5 text-slate-400">Isi form dan klik "Simpan Invoice"</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {savedInvoices.map((inv) => {
                    const isActive = activeInvoiceId === inv.id;
                    const invoiceTotal = inv.items.reduce((sum, item) => sum + (item.price * item.qty), 0) - inv.dpValue - inv.discountValue;
                    return (
                      <div
                        key={inv.id}
                        onClick={() => handleLoadInvoice(inv)}
                        className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
                          isActive
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex flex-col gap-1 pr-14">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700 truncate block max-w-[130px]">
                              {inv.invoiceNo}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {inv.createdAt.split(' ')[0]}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500 truncate max-w-[100px]" title={inv.customerName}>
                              {inv.customerName || 'Tanpa Nama'}
                            </span>
                            <span className="font-semibold text-slate-800 font-mono">
                              {formatRupiah(invoiceTotal)}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons overlay */}
                        <div className="absolute right-2 top-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLoadInvoice(inv);
                            }}
                            className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition"
                            title="Muat invoice"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteInvoice(inv.id, e)}
                            className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 transition"
                            title="Hapus invoice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Pengaturan Repositori & Update */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-slate-500" />
              Repositori & Pembaruan
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Link GitHub Repository</label>
                <input 
                  type="text" 
                  value={githubRepoUrl} 
                  placeholder="https://github.com/username/repo-name"
                  onChange={(e) => setGithubRepoUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
                <span className="text-[9px] text-slate-400 block mt-1 leading-relaxed">
                  Aplikasi akan memantau file `package.json` di repositori ini secara otomatis dan memperingatkan Anda jika ada perubahan versi.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">GitHub Personal Access Token (PAT)</label>
                <input 
                  type="password" 
                  value={githubToken} 
                  placeholder="ghp_xxxxxxxxxxxx"
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
                <span className="text-[9px] text-slate-400 block mt-1 leading-relaxed">
                  Opsional. Diperlukan jika repositori Anda bersifat **Private** agar aplikasi bisa mengunduh informasi versi secara aman.
                </span>
              </div>
              
              <div className="flex gap-2 pt-1.5">
                <button 
                  onClick={() => checkUpdates(false)}
                  disabled={updateStatus === 'checking'}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs py-2 px-3 rounded-lg transition"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${updateStatus === 'checking' ? 'animate-spin' : ''}`} />
                  Cek Pembaruan
                </button>
                {updateStatus === 'available' && (
                  <button 
                    onClick={() => setShowUpdateModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-3 rounded-lg transition"
                  >
                    Buka Modal
                  </button>
                )}
              </div>
              
              <div className="text-[10px] font-medium text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                <span>Versi Saat Ini: <strong className="text-slate-700">v{CURRENT_VERSION}</strong></span>
                {updateStatus === 'latest' && <span className="text-emerald-600 font-bold">Terbaru ✓</span>}
                {updateStatus === 'available' && <span className="text-amber-600 font-bold">Ada Update!</span>}
                {updateStatus === 'checking' && <span className="text-slate-400">Memeriksa...</span>}
              </div>
            </div>
          </div>

        </section>

        {/* LIVE INVOICE PREVIEW / KERTAS KERJA */}
        <section className="lg:col-span-8 flex flex-col items-center">
          
          <div className="w-full max-w-[21cm] bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-xs text-amber-900 flex items-start gap-2.5 shadow-sm print-hidden">
            <HelpCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">💡 Tips Pengeditan WYSIWYG</span>
              Anda dapat mengklik dan mengedit teks langsung pada kertas invoice di bawah ini! Semua kalkulasi harga di baris item, sisa DP, dan sisa tagihan akan otomatis diperbarui secara instan.
            </div>
          </div>

          {/* KERTAS A4 SIMULASI */}
          <div 
            id="invoice-capture-area"
            data-spacing={spacingMode}
            className="bg-white text-slate-800 shadow-xl border border-slate-200 rounded-lg flex flex-col justify-between relative overflow-hidden print:shadow-none print:border-none print:m-0 print:p-0 print:rounded-none"
            style={{ 
              boxSizing: 'border-box',
              fontFamily: 'Inter, system-ui, sans-serif',
              width: '210mm',
              height: '297mm',
              minHeight: '297mm',
              maxHeight: '297mm',
              zoom: spacingMode === 'standard' ? '93%' : spacingMode === 'compact' ? '86%' : '78%',
              padding: spacingMode === 'standard' ? '10mm 14mm' : spacingMode === 'compact' ? '8mm 12mm' : '6mm 10mm'
            }}
          >
            
            {/* Latar Belakang Lingkaran Dekoratif (Aksen Desain Premium) */}
            <div className="absolute top-[-120px] right-[-120px] w-[350px] h-[350px] rounded-full opacity-[0.03] pointer-events-none" style={{ border: `45px solid ${activeTheme.primary}` }}></div>
            <div className="absolute bottom-[-150px] left-[-150px] w-[350px] h-[350px] rounded-full opacity-[0.02] pointer-events-none" style={{ border: `30px solid ${activeTheme.secondary}` }}></div>

            <div>
              
              {/* KOP SURAT (DENGAN LAYOUT DINAMIS: 1 LOGO vs 2 LOGO) */}
              {logoMode === 'double' ? (
                /* ================= MODE 2 LOGO (MENGAPIT) ================= */
                <div className={`flex items-center justify-between w-full gap-2 border-b border-slate-100 ${spacingStyles.kop[spacingMode]}`}>
                  
                  {/* Logo Kiri */}
                  <div className="w-1/4 flex justify-start items-center">
                    {logoLeft ? (
                      <img src={logoLeft} alt="Logo Left" className={`w-auto object-contain ${spacingStyles.logoDouble[spacingMode]}`} />
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
                      className={`w-full text-center font-serif tracking-tight bg-transparent focus:bg-slate-50 focus:outline-none px-1 border border-transparent hover:border-slate-200 rounded ${spacingStyles.brandText[spacingMode]}`}
                      style={{ color: activeTheme.primary }}
                    />
                    <input
                      type="text"
                      value={businessManagement}
                      onChange={(e) => setBusinessManagement(e.target.value)}
                      className={`w-full text-center font-bold tracking-widest uppercase bg-transparent focus:bg-slate-50 focus:outline-none p-0.5 border border-transparent hover:border-slate-200 rounded text-slate-500 ${spacingStyles.brandSubText[spacingMode]}`}
                    />
                    <div className="flex items-center justify-center gap-1.5 py-0.5 w-full">
                      <span className="h-[1px] w-6 bg-slate-200 flex-shrink-0"></span>
                      <span 
                        className={`hidden print-value font-semibold tracking-wide text-center ${spacingStyles.brandTagline[spacingMode]}`}
                        style={{ color: activeTheme.secondary }}
                      >
                        {businessTagline}
                      </span>
                      <input
                        type="text"
                        value={businessTagline}
                        onChange={(e) => setBusinessTagline(e.target.value)}
                        className={`w-full font-semibold tracking-wide text-center bg-transparent focus:bg-slate-50 focus:outline-none p-0.5 border border-transparent hover:border-slate-200 rounded print-input-hide ${spacingStyles.brandTagline[spacingMode]}`}
                        style={{ color: activeTheme.secondary }}
                      />
                      <span className="h-[1px] w-6 bg-slate-200 flex-shrink-0"></span>
                    </div>
                    <input
                      type="text"
                      value={businessLocation}
                      onChange={(e) => setBusinessLocation(e.target.value)}
                      className={`w-full text-center font-bold text-slate-400 bg-transparent focus:bg-slate-50 focus:outline-none p-0.5 ${spacingStyles.brandTagline[spacingMode]}`}
                    />
                  </div>

                  {/* Logo Kanan */}
                  <div className="w-1/4 flex justify-end items-center">
                    {logoRight ? (
                      <img src={logoRight} alt="Logo Right" className={`w-auto object-contain ${spacingStyles.logoDouble[spacingMode]}`} />
                    ) : (
                      renderDefaultLogo('MANAGEMENT')
                    )}
                  </div>

                </div>
              ) : (
                /* ================= MODE 1 LOGO (TENGAH) ================= */
                <div className={`flex flex-col items-center text-center border-b border-slate-100 ${spacingStyles.kop[spacingMode]}`}>
                  <div className="mb-3">
                    {logoLeft ? (
                      <img src={logoLeft} alt="Logo Center" className={`w-auto object-contain ${spacingStyles.logoSingle[spacingMode]}`} />
                    ) : (
                      renderDefaultLogo('PINARAK VILLA')
                    )}
                  </div>

                  <div className="space-y-1 w-full max-w-lg">
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className={`w-full text-center font-serif font-extrabold tracking-tight bg-transparent focus:bg-slate-50 focus:outline-none p-1 border border-transparent hover:border-slate-200 rounded ${spacingStyles.brandText[spacingMode]}`}
                      style={{ color: activeTheme.primary }}
                    />
                    <input
                      type="text"
                      value={businessManagement}
                      onChange={(e) => setBusinessManagement(e.target.value)}
                      className={`w-full text-center font-semibold tracking-wider uppercase bg-transparent focus:bg-slate-50 focus:outline-none p-0.5 border border-transparent hover:border-slate-200 rounded text-slate-500 ${spacingStyles.brandSubText[spacingMode]}`}
                    />
                    <div className="flex items-center justify-center gap-2 py-1 w-full">
                      <span className="h-[1px] w-12 bg-slate-200 flex-shrink-0"></span>
                      <span 
                        className={`hidden print-value font-medium tracking-wide text-center ${spacingStyles.brandTagline[spacingMode]}`}
                        style={{ color: activeTheme.secondary }}
                      >
                        {businessTagline}
                      </span>
                      <input
                        type="text"
                        value={businessTagline}
                        onChange={(e) => setBusinessTagline(e.target.value)}
                        className={`w-full max-w-md font-medium tracking-wide text-center bg-transparent focus:bg-slate-50 focus:outline-none p-0.5 border border-transparent hover:border-slate-200 rounded print-input-hide ${spacingStyles.brandTagline[spacingMode]}`}
                        style={{ color: activeTheme.secondary }}
                      />
                      <span className="h-[1px] w-12 bg-slate-200 flex-shrink-0"></span>
                    </div>
                    <input
                      type="text"
                      value={businessLocation}
                      onChange={(e) => setBusinessLocation(e.target.value)}
                      className={`w-full text-center font-semibold text-slate-400 bg-transparent focus:bg-slate-50 focus:outline-none p-0.5 ${spacingStyles.brandTagline[spacingMode]}`}
                    />
                  </div>
                </div>
              )}

              {/* JUDUL SELEMBAR INVOICE */}
              <div className={`text-center border-y border-slate-100 relative ${spacingStyles.title[spacingMode]}`}>
                <h2 className="text-xl font-bold tracking-widest text-slate-800">INVOICE</h2>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1" style={{ backgroundColor: activeTheme.primary }}></div>
              </div>

              {/* DATA TAMU & SPESIFIKASI RESERVASI */}
              <div className={`grid grid-cols-2 text-slate-700 ${spacingStyles.reservation[spacingMode]}`}>
                
                {/* Panel Kiri: Identitas Customer */}
                <div className={`space-y-2 rounded-lg border border-slate-100 ${spacingStyles.bankBox[spacingMode]}`}>
                  <table className="w-full table-fixed">
                    <tbody>
                      <tr>
                        <td className={`w-28 font-semibold text-slate-500 py-1 ${spacingStyles.reservationTd[spacingMode]}`}>NAMA TAMU</td>
                        <td className={`w-4 text-center text-slate-400 ${spacingStyles.reservationTd[spacingMode]}`}>:</td>
                        <td className={`py-1 ${spacingStyles.reservationTd[spacingMode]}`}>
                          <input 
                            type="text" 
                            value={customerName} 
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full font-semibold bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-200 rounded px-1 text-slate-800"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className={`font-semibold text-slate-500 py-1 ${spacingStyles.reservationTd[spacingMode]}`}>NO. HP</td>
                        <td className={`text-center text-slate-400 ${spacingStyles.reservationTd[spacingMode]}`}>:</td>
                        <td className={`py-1 ${spacingStyles.reservationTd[spacingMode]}`}>
                          <input 
                            type="text" 
                            value={customerPhone} 
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full font-semibold bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-200 rounded px-1"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className={`font-semibold text-slate-500 py-1 ${spacingStyles.reservationTd[spacingMode]}`}>CHECK-IN</td>
                        <td className={`text-center text-slate-400 ${spacingStyles.reservationTd[spacingMode]}`}>:</td>
                        <td className={`py-1 font-semibold text-slate-800 ${spacingStyles.reservationTd[spacingMode]}`}>
                          {new Date(checkInDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                          <span className="text-xs font-normal text-slate-500 ml-1">({checkInTime} WIB)</span>
                        </td>
                      </tr>
                      <tr>
                        <td className={`font-semibold text-slate-500 py-1 ${spacingStyles.reservationTd[spacingMode]}`}>CHECK-OUT</td>
                        <td className={`text-center text-slate-400 ${spacingStyles.reservationTd[spacingMode]}`}>:</td>
                        <td className={`py-1 font-semibold text-slate-800 ${spacingStyles.reservationTd[spacingMode]}`}>
                          {new Date(checkOutDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                          <span className="text-xs font-normal text-slate-500 ml-1">({checkOutTime} WIB)</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Panel Kanan: Kode / Informasi Tagihan */}
                <div className={`space-y-2 rounded-lg border border-slate-100 ${spacingStyles.bankBox[spacingMode]}`}>
                  <table className="w-full table-fixed">
                    <tbody>
                      <tr>
                        <td className={`w-28 font-semibold text-slate-500 py-1 ${spacingStyles.reservationTd[spacingMode]}`}>NO. INVOICE</td>
                        <td className={`text-center text-slate-400 ${spacingStyles.reservationTd[spacingMode]}`}>:</td>
                        <td className={`py-1 ${spacingStyles.reservationTd[spacingMode]}`}>
                          <input 
                            type="text" 
                            value={invoiceNo} 
                            onChange={(e) => setInvoiceNo(e.target.value)}
                            className="w-full font-mono font-semibold bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-200 rounded px-1"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className={`font-semibold text-slate-500 py-1 ${spacingStyles.reservationTd[spacingMode]}`}>METODE BAYAR</td>
                        <td className={`text-center text-slate-400 ${spacingStyles.reservationTd[spacingMode]}`}>:</td>
                        <td className={`py-1 ${spacingStyles.reservationTd[spacingMode]}`}>
                          <input 
                            type="text" 
                            value={paymentMethod} 
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full font-semibold bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-200 rounded px-1"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className={`font-semibold text-slate-500 py-1 ${spacingStyles.reservationTd[spacingMode]}`}>DURASI SEWA</td>
                        <td className={`text-center text-slate-400 ${spacingStyles.reservationTd[spacingMode]}`}>:</td>
                        <td className={`py-1 font-semibold text-slate-800 ${spacingStyles.reservationTd[spacingMode]}`}>
                          {Math.max(1, Math.round((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)))} Malam
                        </td>
                      </tr>
                      <tr>
                        <td className={`font-semibold text-slate-500 py-1 ${spacingStyles.reservationTd[spacingMode]}`}>STATUS RESERVASI</td>
                        <td className={`text-center text-slate-400 ${spacingStyles.reservationTd[spacingMode]}`}>:</td>
                        <td className={`py-1 ${spacingStyles.reservationTd[spacingMode]}`}>
                          <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded animate-pulse" style={{ backgroundColor: activeTheme.accent, color: activeTheme.primary }}>
                            RESERVED / CONFIRMED
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

              {/* DAFTAR VILLA / JASA LAYANAN */}
              <div className={`overflow-hidden rounded-lg border border-slate-200 ${spacingStyles.tableMargin[spacingMode]}`}>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="font-bold text-white uppercase tracking-wider" style={{ backgroundColor: activeTheme.primary }}>
                      <th className={`text-center w-12 ${spacingStyles.tableTh[spacingMode]}`}>No.</th>
                      <th className={`${spacingStyles.tableTh[spacingMode]}`}>Deskripsi Sewa / Layanan</th>
                      <th className={`text-right w-32 ${spacingStyles.tableTh[spacingMode]}`}>Harga Satuan</th>
                      <th className={`text-center w-16 ${spacingStyles.tableTh[spacingMode]}`}>Qty / Malam</th>
                      <th className={`text-right w-36 ${spacingStyles.tableTh[spacingMode]}`}>Total Harga</th>
                      <th className={`w-10 text-center print-hidden ${spacingStyles.tableTh[spacingMode]}`}></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 group">
                        {/* Kolom Nomor */}
                        <td className={`text-center font-mono font-medium text-slate-500 ${spacingStyles.tableTd[spacingMode]}`}>
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        
                        {/* Kolom Nama Item */}
                        <td className={`${spacingStyles.tableTd[spacingMode]}`}>
                          <input 
                            type="text" 
                            value={item.name} 
                            onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                            className="w-full font-semibold bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-200 rounded px-1.5 py-1 text-slate-800 text-xs"
                          />
                        </td>
                        
                        {/* Kolom Harga */}
                        <td className={`text-right ${spacingStyles.tableTd[spacingMode]}`}>
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-slate-400">Rp</span>
                            <input 
                              type="number" 
                              value={item.price} 
                              onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                              className="w-24 text-right font-medium bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-200 rounded px-1 py-1 text-xs print-input-hide"
                            />
                            <span className="print-value font-medium text-xs tabular-nums">{Number(item.price).toLocaleString('id-ID')}</span>
                          </div>
                        </td>
                        
                        {/* Kolom Kuantitas */}
                        <td className={`text-center ${spacingStyles.tableTd[spacingMode]}`}>
                          <input 
                            type="number" 
                            value={item.qty} 
                            min="1"
                            onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                            className="w-12 text-center font-bold bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-200 rounded py-1 text-xs"
                          />
                        </td>
                        
                        {/* Kolom Total Item */}
                        <td className={`text-right font-bold tabular-nums text-slate-800 ${spacingStyles.tableTd[spacingMode]}`}>
                          {formatRupiah(item.price * item.qty)}
                        </td>

                        {/* Tombol Hapus Baris (Sembunyi ketika dicetak) */}
                        <td className={`text-center print-hidden ${spacingStyles.tableTd[spacingMode]}`}>
                          <button 
                            onClick={() => deleteItem(item.id)}
                            className="text-red-450 hover:text-red-600 transition p-1 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100"
                            title="Hapus baris"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Tombol Sisip Item Baru (Sembunyi ketika dicetak) */}
                    <tr className="print-hidden bg-slate-50/50">
                      <td colSpan={6} className="p-2">
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
              <div className={`grid grid-cols-12 items-start ${spacingStyles.summaryGrid[spacingMode]}`}>
                
                {/* Blok Kiri: Data Bank & Aturan Catatan */}
                <div className="col-span-7 space-y-4 text-slate-700">
                  
                  {/* Rekening Pembayaran */}
                  <div className={`rounded-lg border border-slate-200 ${spacingStyles.bankBox[spacingMode]}`}>
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
                <div className={`col-span-5 border-2 rounded-xl ${spacingStyles.financialBox[spacingMode]}`} style={{ borderColor: activeTheme.primary, backgroundColor: activeTheme.accent + '20' }}>
                  
                  {/* Subtotal */}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-600">Subtotal</span>
                    <span className="font-bold tabular-nums text-slate-800">{formatRupiah(subtotal)}</span>
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
                        className="w-20 text-right font-bold bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-300 rounded p-0.5 print-input-hide"
                      />
                      <span className="print-value font-bold tabular-nums">{Number(dpValue).toLocaleString('id-ID')}</span>
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
                        className="w-20 text-right font-bold bg-transparent focus:bg-white focus:outline-none border border-transparent hover:border-slate-300 rounded p-0.5 print-input-hide"
                        style={{ color: '#b91c1c' }}
                      />
                      <span className="print-value font-bold tabular-nums" style={{ color: '#b91c1c' }}>{Number(discountValue).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Sisa Tagihan */}
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-bold text-sm text-slate-800">Total Tagihan (Sisa)</span>
                    <span className="font-extrabold text-base tracking-tight tabular-nums" style={{ color: activeTheme.primary }}>
                      {formatRupiah(totalBill)}
                    </span>
                  </div>

                </div>

              </div>

            </div>

            {/* BANNER BAWAH / STATUS KETENTUAN */}
            <div className={`border-t ${spacingStyles.footerBanner[spacingMode]}`}>
              
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

          <div className="text-slate-400 text-[11px] text-center mt-3 print-hidden max-w-lg">
            Tekan opsi <span className="font-semibold">"Simpan sebagai PDF"</span> untuk pemrosesan super cepat tanpa hambatan.
          </div>

        </section>

      </main>

      {/* FOOTER APLIKASI */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 text-center mt-8 border-t border-slate-800 print-hidden">
        <p>© 2026 Pinarak Villa Management. All rights reserved.</p>
        <p className="text-[10px] mt-1 text-slate-500">Aplikasi pembuat invoice profesional dirancang ramah cetak dan responsif.</p>
      </footer>

    </div>
  );
}
