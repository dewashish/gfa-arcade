// Certificate download helpers. Takes a DOM element (an HTML-rendered
// `<Certificate>` component) and produces either a PNG or a PDF file that
// the student or teacher can save.
//
// html2canvas + jspdf are dynamic-imported so they only ship to the browser
// when someone actually clicks Download on the game-over screen — normal
// play isn't weighed down by ~100 KB of render-to-pdf code.

const CERT_WIDTH = 960;
const CERT_HEIGHT = 680;

async function captureCanvas(el: HTMLElement) {
  const { default: html2canvas } = await import("html2canvas");
  return html2canvas(el, {
    scale: 2, // 2x scale so PNG / PDF look crisp when printed
    backgroundColor: null,
    width: CERT_WIDTH,
    height: CERT_HEIGHT,
    windowWidth: CERT_WIDTH,
    windowHeight: CERT_HEIGHT,
    useCORS: true,
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after a tick so Safari has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

/**
 * Download the certificate as a PNG image. Best for quick-share on
 * WhatsApp / iMessage or as a printable photo.
 */
export async function downloadCertificateAsPng(el: HTMLElement, filename: string) {
  const canvas = await captureCanvas(el);
  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not render certificate PNG"));
        return;
      }
      triggerDownload(blob, filename.endsWith(".png") ? filename : `${filename}.png`);
      resolve();
    }, "image/png");
  });
}

/**
 * Download the certificate as a landscape A4 PDF. Best when the teacher
 * wants to print and hand out.
 */
export async function downloadCertificateAsPdf(el: HTMLElement, filename: string) {
  const canvas = await captureCanvas(el);
  const { default: jsPDF } = await import("jspdf");

  // Landscape A4 in mm: 297 × 210. Fit the 960×680 canvas inside that
  // while preserving aspect ratio. 960/680 ≈ 1.41 — wider than A4's 1.414
  // so we scale to width.
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgRatio = CERT_WIDTH / CERT_HEIGHT;
  let drawW = pageW;
  let drawH = pageW / imgRatio;
  if (drawH > pageH) {
    drawH = pageH;
    drawW = pageH * imgRatio;
  }
  const x = (pageW - drawW) / 2;
  const y = (pageH - drawH) / 2;

  const dataUrl = canvas.toDataURL("image/png");
  pdf.addImage(dataUrl, "PNG", x, y, drawW, drawH, undefined, "FAST");
  pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
