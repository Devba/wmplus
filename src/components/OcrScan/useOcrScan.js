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

  const matchPayee = (payeeName) => {
    if (!payeeName) return null;

    const lower = payeeName.toLowerCase();

    const resident = residents.find(
      (r) => r.fullName?.toLowerCase().includes(lower) ||
             r.lastName?.toLowerCase().includes(lower)
    );
    if (resident) return { type: 'resident', id: resident.id, name: resident.fullName, address: resident.address };

    const vendor = vendors.find(
      (v) => v.name?.toLowerCase().includes(lower)
    );
    if (vendor) return { type: 'vendor', id: vendor.id, name: vendor.name };

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
    Swal.fire({
      ...OCR_SWAL_BASE,
      title: 'Check data extracted',
      html: `
        <div style="text-align:left;display:flex;flex-direction:column;gap:8px;">
          <label>Check # <input id="ocr-checkNo" class="swal2-input" value="${data.checkNumber || ''}"></label>
          <label>Amount <input id="ocr-amount" class="swal2-input" value="${data.amount || ''}"></label>
          <label>Date (MM/DD/YYYY) <input id="ocr-date" class="swal2-input" value="${data.date || ''}"></label>
          <label>Payee <input id="ocr-payee" class="swal2-input" value="${data.payeeName || ''}"></label>
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
