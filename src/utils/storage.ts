// Migrasi key localStorage pinarak_* -> universal_*.
// Dijalankan sekali saat modul dimuat, sebelum useState initializer App
// membaca key universal_*. Data lama disalin (bukan dipindah) agar aman.

const LEGACY_PREFIX = 'pinarak_';
const UNIVERSAL_PREFIX = 'universal_';

export function migrateLegacyKeys(): void {
  try {
    const toCopy: Array<[string, string]> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(LEGACY_PREFIX)) {
        const next = UNIVERSAL_PREFIX + key.slice(LEGACY_PREFIX.length);
        if (localStorage.getItem(next) === null) {
          toCopy.push([key, next]);
        }
      }
    }
    for (const [from, to] of toCopy) {
      const value = localStorage.getItem(from);
      if (value !== null) localStorage.setItem(to, value);
    }
  } catch {
    // localStorage tidak tersedia (mis. SSR/test) -> abaikan diam-diam.
  }
}
