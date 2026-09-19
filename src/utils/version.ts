// Perbandingan versi semver "x.y.z". Dipindah dari src/App.tsx tanpa perubahan.

export function isNewerVersion(current: string, remote: string): boolean {
  const curParts = current.split('.').map(Number);
  const remParts = remote.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const curVal = curParts[i] || 0;
    const remVal = remParts[i] || 0;
    if (remVal > curVal) return true;
    if (remVal < curVal) return false;
  }
  return false;
}
