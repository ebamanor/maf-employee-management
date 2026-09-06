import { jsPDF } from "jspdf";

const LOGO_URL = "/logo/maf-black.png";

export function loadLogo(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = LOGO_URL;
  });
}

export async function addLogoToPdf(doc: jsPDF, logoWidth = 55) {
  const img = await loadLogo();
  const pageWidth = doc.internal.pageSize.getWidth();
  const x = (pageWidth - logoWidth) / 2;
  const logoHeight = (img.height / img.width) * logoWidth;
  doc.addImage(img, "PNG", x, 10, logoWidth, logoHeight);
  return 10 + logoHeight + 8;
}
