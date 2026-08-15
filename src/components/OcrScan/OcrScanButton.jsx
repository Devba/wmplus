import useOcrScan from './useOcrScan';

export default function OcrScanButton({
  residents = [],
  vendors = [],
  banks = [],
  glAccounts = [],
  onComplete,
  className = 'ocr-scan-btn'
}) {
  const { handleScan } = useOcrScan({
    residents,
    vendors,
    banks,
    glAccounts,
    onComplete
  });

  return (
    <button
      type="button"
      className={className}
      onClick={handleScan}
    >
      📷 Scan Check
    </button>
  );
}
