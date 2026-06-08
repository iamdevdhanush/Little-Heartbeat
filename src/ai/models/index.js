export class MLModelAdapter {
  constructor(options = {}) {
    this.modelType = options.modelType || null;
    this.modelPath = options.modelPath || null;
    this.loaded = false;
  }

  async load() {
    throw new Error('MLModelAdapter.load() must be implemented by a subclass');
  }

  async predict(input) {
    throw new Error('MLModelAdapter.predict() must be implemented by a subclass');
  }

  async extractMedicines(imageData) {
    throw new Error('MLModelAdapter.extractMedicines() must be implemented by a subclass');
  }

  async batchExtract(images) {
    const results = [];
    for (const img of images) {
      results.push(await this.extractMedicines(img));
    }
    return results;
  }

  async unload() {
    this.loaded = false;
  }

  isLoaded() {
    return this.loaded;
  }
}

export class RuleBasedExtractor extends MLModelAdapter {
  constructor(patternEngine) {
    super({ modelType: 'rule-based' });
    this.patternEngine = patternEngine;
    this.loaded = true;
  }

  async load() {
    this.loaded = true;
    return true;
  }

  async predict(text) {
    if (!this.patternEngine) return { medicines: [] };
    return this.patternEngine(text);
  }

  async extractMedicines(imageData) {
    throw new Error('RuleBasedExtractor does not support image processing directly. Use OCR pipeline.');
  }
}

export function createModelAdapter(type, options = {}) {
  switch (type) {
    case 'rule-based':
      return new RuleBasedExtractor(options.patternEngine);
    default:
      throw new Error(`Unknown model type: ${type}`);
  }
}
