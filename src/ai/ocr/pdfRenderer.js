import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export async function renderPDFToImages(pdfFile, options = {}) {
  const { maxPages = 10, scale = 2.0 } = options;

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const totalPages = Math.min(pdf.numPages, maxPages);
  const images = [];

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = new OffscreenCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    await page.render({ canvasContext: context, viewport }).promise;

    const blob = await canvas.convertToBlob({ type: 'image/png' });
    const imageUrl = URL.createObjectURL(blob);

    images.push({
      pageNumber: i,
      blob,
      imageUrl,
      width: viewport.width,
      height: viewport.height,
    });
  }

  return { images, totalPages, pdf };
}

export async function getPDFPageCount(pdfFile) {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  return pdf.numPages;
}
