import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../config/api';

const OCR_SWAL_BASE = { zIndex: 20000 };

export default function useOcrScan({
  residents = [],
  vendors = [],
  banks = [],
  glAccounts = [],
  onComplete
}) {
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const levenshtein = (a, b) => {
    const m = a.length;
    const n = b.length;

    if (m === 0) return n;
    if (n === 0) return m;

    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    let curr = new Array(n + 1);

    for (let i = 1; i <= m; i += 1) {
      curr[0] = i;
      for (let j = 1; j <= n; j += 1) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        curr[j] = Math.min(
          curr[j - 1] + 1,
          prev[j] + 1,
          prev[j - 1] + cost
        );
      }
      [prev, curr] = [curr, prev];
    }

    return prev[n];
  };

  const similarity = (a, b) => {
    if (!a || !b) return 0;
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    return 1 - levenshtein(a, b) / maxLen;
  };

  const normalizeName = (value) =>
    String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const matchPayee = (payeeName) => {
    const target = normalizeName(payeeName);
    if (!target) return null;

    const THRESHOLD = 0.7;
    let best = null;
    let bestScore = 0;

    const consider = (candidate, type) => {
      const full = normalizeName(candidate.fullName || candidate.name);
      const last = normalizeName(candidate.lastName);

      const entries = [
        { name: full, whole: true },
        ...(last ? [{ name: last, whole: false }] : [])
      ];

      entries.forEach(({ name, whole }) => {
        if (!name) return;

        let score = similarity(target, name);

        if (name.includes(target) || target.includes(name)) {
          score = Math.max(score, whole ? 0.95 : 0.5);
        }

        if (score > bestScore) {
          bestScore = score;
          best = {
            type,
            id: candidate.id,
            name: candidate.fullName || candidate.name || '',
            address: candidate.address || ''
          };
        }
      });
    };

    residents.forEach((r) => consider(r, 'resident'));
    vendors.forEach((v) => consider(v, 'vendor'));

    if (best && bestScore >= THRESHOLD) {
      return { ...best, score: Math.round(bestScore * 100) };
    }

    return null;
  };

  const matchBank = (bankText) => {
    if (!bankText) return null;
    const lower = bankText.toLowerCase();
    return banks.find(
      (b) => b.name?.toLowerCase().includes(lower) ||
             b.id?.toLowerCase() === lower
    ) || null;
  };

  const applyFields = (fields) => {
    if (!onComplete) return;

    const payee = matchPayee(fields.payeeName);
    const bank = matchBank(fields.bankAccount);

    onComplete({
      checkNumber: fields.checkNumber || '',
      amount: fields.amount || '',
      date: fields.date || '',
      payeeName: fields.payeeName || '',
      bankId: bank?.id || '',
      bankName: bank?.name || '',
      glNumber: fields.glNumber || '',
      payee
    });
  };

  const showConfirm = (data) => {
    const payeeMatch = matchPayee(data.payeeName);
    const matchHint = payeeMatch
      ? `<div style="font-size:12px;color:#1a7a3a;margin-top:-4px;">✓ Match: ${payeeMatch.name} (${payeeMatch.type}) — ${payeeMatch.score}%</div>`
      : '<div style="font-size:12px;color:#b00020;margin-top:-4px;">⚠ Sin coincidencia en residentes/vendors</div>';

    Swal.fire({
      ...OCR_SWAL_BASE,
      title: 'Check data extracted',
      html: `
        <div style="text-align:left;display:flex;flex-direction:column;gap:8px;">
          <label>Check # <input id="ocr-checkNo" class="swal2-input" value="${data.checkNumber || ''}"></label>
          <label>Amount <input id="ocr-amount" class="swal2-input" value="${data.amount || ''}"></label>
          <label>Date (MM/DD/YYYY) <input id="ocr-date" class="swal2-input" value="${data.date || ''}"></label>
          <label>Payee <input id="ocr-payee" class="swal2-input" value="${data.payeeName || ''}"></label>
          ${matchHint}
          <label>Bank Account <input id="ocr-bank" class="swal2-input" value="${data.bankAccount || ''}"></label>
          <label>G/L Number <input id="ocr-gl" class="swal2-input" value="${data.glNumber || ''}"></label>
        </div>`,
      showCancelButton: true,
      confirmButtonText: 'Apply to form',
      cancelButtonText: 'Cancel',
      width: '480px',
      preConfirm: () => {
        const popup = Swal.getPopup();
        return {
          checkNumber: popup.querySelector('#ocr-checkNo').value,
          amount: popup.querySelector('#ocr-amount').value,
          date: popup.querySelector('#ocr-date').value,
          payeeName: popup.querySelector('#ocr-payee').value,
          bankAccount: popup.querySelector('#ocr-bank').value,
          glNumber: popup.querySelector('#ocr-gl').value
        };
      }
    }).then((result) => {
      if (result.isConfirmed) applyFields(result.value);
    });
  };

  const runOcr = async (file) => {
    Swal.fire({
      ...OCR_SWAL_BASE,
      title: 'Processing OCR...',
      text: 'Analyzing check image',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const image = await fileToBase64(file);
      const res = await fetch(`${API_BASE_URL}/ocr/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      showConfirm(data);
    } catch (err) {
      Swal.fire({
        ...OCR_SWAL_BASE,
        icon: 'error',
        title: 'OCR Error',
        text: err.message || 'Could not process image'
      });
    }
  };

  const handleScan = () => {
    Swal.fire({
      ...OCR_SWAL_BASE,
      title: 'Scan Check',
      html: `
        <div style="display:flex;flex-direction:column;gap:10px;">
          <label style="cursor:pointer;padding:12px;border:1px solid #ccc;border-radius:6px;display:block;">
            📷 Take photo (camera)
            <input type="file" id="ocr-file-camera" accept="image/*" capture="environment" style="display:none;">
          </label>
          <label style="cursor:pointer;padding:12px;border:1px solid #ccc;border-radius:6px;display:block;">
            📎 Upload document / image
            <input type="file" id="ocr-file-upload" accept="image/*,application/pdf" style="display:none;">
          </label>
        </div>`,
      showConfirmButton: false,
      didOpen: () => {
        const popup = Swal.getPopup();

        popup.querySelector('#ocr-file-camera').addEventListener('change', (event) => {
          const file = event.target.files[0];
          if (file) runOcr(file);
        });

        popup.querySelector('#ocr-file-upload').addEventListener('change', (event) => {
          const file = event.target.files[0];
          if (file) runOcr(file);
        });
      }
    });
  };

  return { handleScan };
}
