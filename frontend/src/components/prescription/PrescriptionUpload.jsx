import React, { useState, useCallback, useRef, useEffect } from 'react';
import { processPrescriptionFile, PipelineState } from '../../ai/extraction/prescriptionPipeline.js';
import ExtractionResult from './ExtractionResult.jsx';

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_TYPES = {
  'image/jpeg': true,
  'image/png': true,
  'image/webp': true,
  'application/pdf': true,
};

export default function PrescriptionUpload({ userId, onComplete, onError }) {
  const [pipelineState, setPipelineState] = useState(PipelineState.IDLE);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleStateChange = useCallback((state) => {
    setPipelineState(state);
    if (state === PipelineState.ERROR) {
      setError('An error occurred during processing');
    }
  }, []);

  const handleProgress = useCallback((p) => {
    setProgress(p);
  }, []);

  const validateFile = useCallback((f) => {
    if (!f) return 'No file selected';
    if (!ALLOWED_TYPES[f.type] && !f.name?.match(/\.(jpg|jpeg|png|webp|pdf)$/i)) {
      return 'Unsupported file type. Please upload JPG, PNG, WebP, or PDF.';
    }
    if (f.size > MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 20MB.';
    }
    if (f.size === 0) {
      return 'File is empty.';
    }
    return null;
  }, []);

  const handleFile = useCallback((f) => {
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      if (onError) onError(validationError);
      return;
    }

    setError(null);
    setResult(null);
    setFile(f);

    if (f.type === 'application/pdf' || f.name?.endsWith('.pdf')) {
      setPreviewUrl(null);
    } else {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(f));
    }
  }, [validateFile, previewUrl, onError]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleFile]);

  const handleProcess = useCallback(async () => {
    if (!file) return;

    setPipelineState(PipelineState.PREPROCESSING);
    setError(null);

    const res = await processPrescriptionFile(file, {
      onStateChange: handleStateChange,
      onProgress: handleProgress,
    });

    setResult(res);

    if (res.success) {
      setPipelineState(PipelineState.COMPLETE);
    } else {
      setError(res.error || 'Processing failed');
      setPipelineState(PipelineState.ERROR);
      if (onError) onError(res.error);
    }
  }, [file, handleStateChange, handleProgress, onError]);

  const handleReset = useCallback(() => {
    setPipelineState(PipelineState.IDLE);
    setProgress(null);
    setResult(null);
    setError(null);
    setFile(null);
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  }, [previewUrl]);

  const handleComplete = useCallback((confirmedMedicines) => {
    if (onComplete) {
      onComplete({ ...result, medicines: confirmedMedicines });
    }
  }, [result, onComplete]);

  const isProcessing = pipelineState === PipelineState.OCR_IN_PROGRESS ||
    pipelineState === PipelineState.PREPROCESSING ||
    pipelineState === PipelineState.PARSING ||
    pipelineState === PipelineState.SCORING;

  const progressPercent = progress?.percent || 0;

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  if (result?.success) {
    return (
      <ExtractionResult
        result={result}
        userId={userId}
        onComplete={handleComplete}
        onBack={handleReset}
      />
    );
  }

  return (
    <div>
      {/* Drop zone */}
      {(pipelineState === PipelineState.IDLE || error) && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragOver ? 'var(--color-primary)' : file ? 'var(--color-border-strong)' : 'var(--color-border-medium)'}`,
            borderRadius: 'var(--radius-card)',
            padding: '32px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            background: isDragOver ? 'var(--color-primary-tint)' : 'var(--color-surface-tint)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />

          {!file ? (
            <div>
              <div style={{
                width: 56, height: 56, borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary-tint)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', fontSize: 24,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                Upload Prescription
              </p>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Drag & drop a photo or PDF, or tap to browse
              </p>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
                <span className="badge badge-outline">JPG</span>
                <span className="badge badge-outline">PNG</span>
                <span className="badge badge-outline">WebP</span>
                <span className="badge badge-outline">PDF</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 12 }}>
                Max file size: 20MB
              </p>
            </div>
          ) : (
            <div>
              {/* File preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left' }}>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Prescription preview"
                    style={{
                      width: 72, height: 72, borderRadius: 'var(--radius-md)',
                      objectFit: 'cover', border: '1px solid var(--color-border)',
                    }}
                  />
                ) : (
                  <div style={{
                    width: 72, height: 72, borderRadius: 'var(--radius-md)',
                    background: 'var(--color-danger-tint)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2, wordBreak: 'break-word' }}>
                    {file.name}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleReset(); }}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-text-muted)', padding: '6px 10px' }}
                >
                  Change
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div style={{
          marginTop: 12, padding: '12px 16px',
          background: 'var(--color-danger-tint)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255,107,107,0.2)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <p style={{ fontSize: 13, color: 'var(--color-danger-dark)', flex: 1 }}>{error}</p>
          <button onClick={handleReset} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)', fontSize: 12 }}>
            Try Again
          </button>
        </div>
      )}

      {/* Process button */}
      {file && pipelineState === PipelineState.IDLE && !error && (
        <button
          onClick={handleProcess}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: 12 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Extract Prescription
        </button>
      )}

      {/* Processing bar */}
      {isProcessing && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
            <div className="sos-pulse" />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {progress?.message || 'Processing...'}
            </p>
          </div>
          <div className="progress-bar" style={{ background: 'var(--color-border)', height: 8 }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${progressPercent}%`,
                background: 'var(--gradient-primary)',
              }}
            />
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
            {progressPercent}% · Powered by Local AI
          </p>
        </div>
      )}
    </div>
  );
}
