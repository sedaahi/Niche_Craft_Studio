import { ODEV_4_PDF_BASE64, ODEV_3_PDF_BASE64, ODEV_2_PDF_BASE64 } from '../data/embeddedHomeworkPdfs';

/**
 * Pure Client-Side PDF Downloader for Niche Craft Studio
 * Converts in-memory embedded PDF base64 directly to a downloadable Blob.
 * Bypasses all server redirects, iframe restrictions, SPA rewrites, and network issues.
 */

function base64ToBlob(base64: string, type = 'application/pdf'): Blob {
  const binStr = atob(base64);
  const len = binStr.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = binStr.charCodeAt(i);
  }
  return new Blob([arr], { type });
}

export function downloadHomeworkPdf(
  type: 'odev4' | 'odev3' | 'odev2' | string = 'odev4',
  customFilename?: string
): { success: boolean; message: string } {
  try {
    const lower = String(type).toLowerCase();
    let base64 = ODEV_4_PDF_BASE64;
    let defaultName = 'NicheCraftStudio_Odev_4_Bitirme_Projesi_Karti.pdf';

    if (lower.includes('odev_2') || lower.includes('odev2')) {
      base64 = ODEV_2_PDF_BASE64;
      defaultName = 'NicheCraftStudio_Odev_2_Teslim_Raporu.pdf';
    } else if (lower.includes('odev_3') || lower.includes('odev3')) {
      base64 = ODEV_3_PDF_BASE64;
      defaultName = 'NicheCraftStudio_Odev_3_Guncel_Teslim_Raporu.pdf';
    } else if (lower.includes('odev_4') || lower.includes('odev4') || lower.includes('bitirme')) {
      base64 = ODEV_4_PDF_BASE64;
      defaultName = 'NicheCraftStudio_Odev_4_Bitirme_Projesi_Karti.pdf';
    }
    const targetName = customFilename || defaultName;

    const blob = base64ToBlob(base64, 'application/pdf');
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = targetName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 2000);

    return {
      success: true,
      message: `${targetName} başarıyla bilgisayarınıza indirildi.`,
    };
  } catch (err: any) {
    console.error('[Client-Side PDF Download Failed]:', err);
    return {
      success: false,
      message: 'PDF indirilemedi: ' + (err.message || 'Hata oluştu'),
    };
  }
}
