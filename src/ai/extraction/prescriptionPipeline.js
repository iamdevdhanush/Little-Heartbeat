import { recognizeImage, initTesseractWorker, terminateWorker, getTesseractWorker } from '../ocr/tesseract.js';
import { renderPDFToImages } from '../ocr/pdfRenderer.js';
import { parsePrescriptionText } from '../parser/index.js';
import { scoreOverallExtraction } from '../confidence/index.js';

export const PipelineState = {
  IDLE: 'idle',
  PREPROCESSING: 'preprocessing',
  OCR_IN_PROGRESS: 'ocr_in_progress',
  PARSING: 'parsing',
  SCORING: 'scoring',
  COMPLETE: 'complete',
  ERROR: 'error',
};

export async function processPrescriptionFile(file, options = {}) {
  const {
    onStateChange = () => {},
    onProgress = () => {},
    language = 'eng',
    pdfScale = 2.0,
  } = options;

  try {
    onStateChange(PipelineState.PREPROCESSING);

    const fileType = file.type || file.name?.split('.').pop()?.toLowerCase();
    const isPDF = fileType === 'application/pdf' || fileType === 'pdf';

    let images = [];

    if (isPDF) {
      onProgress({ phase: 'pdf-render', message: 'Rendering PDF pages...', percent: 0 });
      const result = await renderPDFToImages(file, { scale: pdfScale });
      images = result.images;
      onProgress({ phase: 'pdf-render', message: `Rendered ${images.length} page(s)`, percent: 100 });
    } else {
      const imageUrl = URL.createObjectURL(file);
      images = [{ imageUrl, blob: file, pageNumber: 1 }];
    }

    onStateChange(PipelineState.OCR_IN_PROGRESS);

    await initTesseractWorker(language);

    let combinedText = '';
    let overallOcrConfidence = 0;
    let textCount = 0;

    for (let i = 0; i < images.length; i++) {
      const pageLabel = `Recognizing page ${i + 1} of ${images.length}...`;
      const pageBase = Math.round(((i) / images.length) * 80);
      onProgress({
        phase: 'ocr',
        message: pageLabel,
        percent: pageBase,
        page: i + 1,
        totalPages: images.length,
      });

      const result = await recognizeImage(images[i].imageUrl, {
        onProgress: (tp) => {
          const pct = Math.round(
            ((i + (tp.progress || 0)) / images.length) * 80,
          );
          onProgress({
            phase: 'ocr',
            message: pageLabel,
            percent: pct,
            page: i + 1,
            totalPages: images.length,
          });
        },
      });

      if (result.text) {
        combinedText += result.text + '\n';
        overallOcrConfidence += result.confidence;
        textCount++;
      }

      if (images[i].imageUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(images[i].imageUrl);
      }
    }

    overallOcrConfidence = textCount > 0 ? overallOcrConfidence / textCount : 0;
    onProgress({ phase: 'ocr', message: 'OCR complete', percent: 80 });

    if (!combinedText.trim()) {
      throw new Error('No text could be extracted from the image. Please try a clearer image.');
    }

    onStateChange(PipelineState.PARSING);
    onProgress({ phase: 'parse', message: 'Parsing prescription data...', percent: 85 });

    const parsed = parsePrescriptionText(combinedText);

    onStateChange(PipelineState.SCORING);
    onProgress({ phase: 'score', message: 'Scoring confidence...', percent: 95 });

    const confidence = scoreOverallExtraction(parsed.medicines, overallOcrConfidence);

    onStateChange(PipelineState.COMPLETE);
    onProgress({ phase: 'complete', message: 'Done', percent: 100 });

    return {
      success: true,
      rawText: combinedText,
      ocrConfidence: overallOcrConfidence,
      medicines: parsed.medicines.map((m, idx) => ({
        ...m,
        id: `med-${Date.now()}-${idx}`,
        confidence: confidence.medicines?.[idx]?.overall ?? null,
        confirmed: false,
        edited: false,
      })),
      doctor: parsed.doctor,
      dates: parsed.dates,
      medicineCount: parsed.medicineCount,
      confidence: {
        overall: confidence.overall,
        verdict: confidence.verdict,
      },
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        pages: images.length,
      },
    };
  } catch (error) {
    onStateChange(PipelineState.ERROR);
    onProgress({ phase: 'error', message: error.message, percent: 0 });

    return {
      success: false,
      error: error.message,
      rawText: null,
      medicines: [],
      doctor: {},
      dates: {},
      medicineCount: 0,
      confidence: { overall: 0, verdict: 'low' },
      fileInfo: { name: file.name, size: file.size, type: file.type },
    };
  } finally {
    try {
      await terminateWorker();
    } catch {}
  }
}
