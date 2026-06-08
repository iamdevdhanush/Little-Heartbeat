import Tesseract from 'tesseract.js';

let worker = null;

export async function initTesseractWorker(language = 'eng') {
  if (worker) {
    try {
      await worker.terminate();
    } catch {}
  }

  worker = await Tesseract.createWorker(language);
  return worker;
}

export async function getTesseractWorker() {
  if (!worker) {
    worker = await initTesseractWorker();
  }
  return worker;
}

export async function recognizeImage(imageSource, options = {}) {
  const activeWorker = options.worker || await getTesseractWorker();

  const config = {
    logger: options.onProgress || null,
  };

  const result = await activeWorker.recognize(imageSource, config);

  return {
    text: result.data.text,
    confidence: result.data.confidence,
    words: result.data.words || [],
    blocks: result.data.blocks || [],
    paragraphs: result.data.paragraphs || [],
    lines: result.data.lines || [],
    oem: result.data.oem,
    version: result.data.version,
  };
}

export async function recognizeImageWithProgress(imageSource, onProgress) {
  return recognizeImage(imageSource, { onProgress });
}

export async function terminateWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}

export async function isWorkerReady() {
  return worker !== null;
}
