/**
 * useChunkUpload Hook
 * Manages multiple chunked file uploads with progress tracking
 */

import { useState, useCallback, useRef } from 'react';
import { ChunkUploader, UploadProgress } from '@/utils/chunkUploader';
import { api } from '@/api-service';

export interface UploadItem {
  id: string;
  file: File;
  uploader: ChunkUploader | null;
  progress: UploadProgress;
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'error';
  error?: string;
  useChunking: boolean;
}

// Threshold for using chunking (10MB)
const CHUNKING_THRESHOLD = 10 * 1024 * 1024;

// Chunk size based on file size
const getChunkSize = (fileSize: number): number => {
  if (fileSize < 100 * 1024 * 1024) {
    // < 100MB: 5MB chunks
    return 5 * 1024 * 1024;
  } else if (fileSize < 500 * 1024 * 1024) {
    // 100MB - 500MB: 10MB chunks
    return 10 * 1024 * 1024;
  } else {
    // > 500MB: 10MB chunks
    return 10 * 1024 * 1024;
  }
};

// Parallel uploads based on file size
const getParallelUploads = (fileSize: number): number => {
  if (fileSize < 100 * 1024 * 1024) {
    // < 100MB: Sequential
    return 1;
  } else if (fileSize < 500 * 1024 * 1024) {
    // 100MB - 500MB: 3 parallel
    return 3;
  } else {
    // > 500MB: 5 parallel
    return 5;
  }
};

export const useChunkUpload = () => {
  const [uploads, setUploads] = useState<Map<string, UploadItem>>(new Map());
  const uploadsRef = useRef<Map<string, UploadItem>>(new Map());

  // Sync uploads with ref
  const syncUploads = useCallback((updater: (prev: Map<string, UploadItem>) => Map<string, UploadItem>) => {
    setUploads((prev) => {
      const updated = updater(prev);
      uploadsRef.current = updated;
      return updated;
    });
  }, []);

  /**
   * Add files to upload queue
   */
  const addFiles = useCallback((files: File[], onComplete?: (fileId: string, success: boolean) => void) => {
    console.log('📦 [useChunkUpload] Adding files:', files.length);

    syncUploads((prev) => {
      const newUploads = new Map(prev);

      files.forEach((file) => {
        const useChunking = file.size > CHUNKING_THRESHOLD;
        const uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        console.log(`📄 [useChunkUpload] File: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        console.log(`   Strategy: ${useChunking ? 'CHUNKED' : 'DIRECT'}`);

        let uploader: ChunkUploader | null = null;
        let totalChunks = 1;

        if (useChunking) {
          const chunkSize = getChunkSize(file.size);
          const parallelUploads = getParallelUploads(file.size);
          totalChunks = Math.ceil(file.size / chunkSize);

          console.log(`   Chunk size: ${(chunkSize / 1024 / 1024).toFixed(2)} MB`);
          console.log(`   Total chunks: ${totalChunks}`);
          console.log(`   Parallel: ${parallelUploads}`);

          uploader = new ChunkUploader(file, {
            chunkSize,
            parallelUploads,
            maxRetries: 3,
            onProgress: (progress) => {
              setUploads((prev) => {
                const updated = new Map(prev);
                const item = updated.get(uploadId);
                if (item) {
                  item.progress = progress;
                  updated.set(uploadId, item);
                }
                uploadsRef.current = updated;
                return updated;
              });
            },
            onChunkComplete: (chunkIndex) => {
              console.log(`✅ [useChunkUpload] Chunk ${chunkIndex} completed for ${file.name}`);
            },
            onChunkError: (chunkIndex, error) => {
              console.error(`❌ [useChunkUpload] Chunk ${chunkIndex} failed for ${file.name}:`, error);
            },
          });
        }

        const uploadItem: UploadItem = {
          id: uploadId,
          file,
          uploader,
          progress: {
            uploadedBytes: 0,
            totalBytes: file.size,
            percentage: 0,
            uploadedChunks: 0,
            totalChunks,
            currentChunkIndex: 0,
            speed: 0,
            estimatedTimeRemaining: 0,
          },
          status: 'pending',
          useChunking,
        };

        newUploads.set(uploadId, uploadItem);
      });

      return newUploads;
    });

    // Auto-start uploads
    setTimeout(() => {
      uploadsRef.current.forEach((item) => {
        if (item.status === 'pending') {
          startUpload(item.id, onComplete);
        }
      });
    }, 100);
  }, [syncUploads]);

  /**
   * Start upload
   */
  const startUpload = useCallback(async (uploadId: string, onComplete?: (fileId: string, success: boolean) => void) => {
    const item = uploadsRef.current.get(uploadId);
    if (!item) {
      console.warn(`⚠️ [useChunkUpload] Upload ${uploadId} not found`);
      return;
    }

    console.log(`⬆️ [useChunkUpload] Starting upload: ${item.file.name}`);

    // Update status to uploading
    syncUploads((prev) => {
      const updated = new Map(prev);
      const current = updated.get(uploadId);
      if (current) {
        current.status = 'uploading';
        updated.set(uploadId, current);
      }
      return updated;
    });

    try {
      if (item.useChunking && item.uploader) {
        // Chunked upload
        console.log(`📦 [useChunkUpload] Using CHUNKED upload for ${item.file.name}`);
        const result = await item.uploader.upload();

        if (result.success) {
          console.log(`✅ [useChunkUpload] Chunked upload successful: ${item.file.name}`);
          syncUploads((prev) => {
            const updated = new Map(prev);
            const current = updated.get(uploadId);
            if (current) {
              current.status = 'completed';
              current.progress.percentage = 100;
              updated.set(uploadId, current);
            }
            return updated;
          });
          onComplete?.(uploadId, true);
        } else {
          throw new Error(result.error || 'Chunked upload failed');
        }
      } else {
        // Direct upload
        console.log(`📤 [useChunkUpload] Using DIRECT upload for ${item.file.name}`);
        
        // Simulate progress for direct upload
        const progressInterval = setInterval(() => {
          syncUploads((prev) => {
            const updated = new Map(prev);
            const current = updated.get(uploadId);
            if (current && current.status === 'uploading') {
              const increment = Math.min(10, 100 - current.progress.percentage);
              current.progress.percentage = Math.min(99, current.progress.percentage + increment);
              current.progress.uploadedBytes = Math.floor((current.progress.percentage / 100) * current.file.size);
              updated.set(uploadId, current);
            }
            return updated;
          });
        }, 200);

        const response = await api.files.upload(item.file);
        clearInterval(progressInterval);

        if (response.status === 200 || response.status === 201) {
          console.log(`✅ [useChunkUpload] Direct upload successful: ${item.file.name}`);
          syncUploads((prev) => {
            const updated = new Map(prev);
            const current = updated.get(uploadId);
            if (current) {
              current.status = 'completed';
              current.progress.percentage = 100;
              current.progress.uploadedBytes = current.file.size;
              updated.set(uploadId, current);
            }
            return updated;
          });
          onComplete?.(uploadId, true);
        } else {
          throw new Error('Direct upload failed');
        }
      }
    } catch (error) {
      console.error(`❌ [useChunkUpload] Upload failed: ${item.file.name}`, error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      syncUploads((prev) => {
        const updated = new Map(prev);
        const current = updated.get(uploadId);
        if (current) {
          current.status = 'error';
          current.error = errorMessage;
          updated.set(uploadId, current);
        }
        return updated;
      });
      onComplete?.(uploadId, false);
    }
  }, [syncUploads]);

  /**
   * Pause upload
   */
  const pauseUpload = useCallback((uploadId: string) => {
    const item = uploadsRef.current.get(uploadId);
    if (!item || !item.uploader) {
      console.warn(`⚠️ [useChunkUpload] Cannot pause ${uploadId}: no uploader`);
      return;
    }

    console.log(`⏸️ [useChunkUpload] Pausing upload: ${item.file.name}`);
    item.uploader.pause();

    syncUploads((prev) => {
      const updated = new Map(prev);
      const current = updated.get(uploadId);
      if (current) {
        current.status = 'paused';
        updated.set(uploadId, current);
      }
      return updated;
    });
  }, [syncUploads]);

  /**
   * Resume upload
   */
  const resumeUpload = useCallback((uploadId: string) => {
    const item = uploadsRef.current.get(uploadId);
    if (!item || !item.uploader) {
      console.warn(`⚠️ [useChunkUpload] Cannot resume ${uploadId}: no uploader`);
      return;
    }

    console.log(`▶️ [useChunkUpload] Resuming upload: ${item.file.name}`);
    item.uploader.resume();

    syncUploads((prev) => {
      const updated = new Map(prev);
      const current = updated.get(uploadId);
      if (current) {
        current.status = 'uploading';
        updated.set(uploadId, current);
      }
      return updated;
    });
  }, [syncUploads]);

  /**
   * Cancel upload
   */
  const cancelUpload = useCallback((uploadId: string) => {
    const item = uploadsRef.current.get(uploadId);
    if (!item) {
      console.warn(`⚠️ [useChunkUpload] Cannot cancel ${uploadId}: not found`);
      return;
    }

    console.log(`⏹️ [useChunkUpload] Cancelling upload: ${item.file.name}`);
    
    if (item.uploader) {
      item.uploader.cancel();
    }

    syncUploads((prev) => {
      const updated = new Map(prev);
      updated.delete(uploadId);
      return updated;
    });
  }, [syncUploads]);

  /**
   * Retry upload
   */
  const retryUpload = useCallback((uploadId: string, onComplete?: (fileId: string, success: boolean) => void) => {
    const item = uploadsRef.current.get(uploadId);
    if (!item) {
      console.warn(`⚠️ [useChunkUpload] Cannot retry ${uploadId}: not found`);
      return;
    }

    console.log(`🔄 [useChunkUpload] Retrying upload: ${item.file.name}`);

    // Reset progress
    syncUploads((prev) => {
      const updated = new Map(prev);
      const current = updated.get(uploadId);
      if (current) {
        current.status = 'pending';
        current.error = undefined;
        current.progress = {
          uploadedBytes: 0,
          totalBytes: current.file.size,
          percentage: 0,
          uploadedChunks: 0,
          totalChunks: current.progress.totalChunks,
          currentChunkIndex: 0,
          speed: 0,
          estimatedTimeRemaining: 0,
        };
        updated.set(uploadId, current);
      }
      return updated;
    });

    // Restart upload
    setTimeout(() => {
      startUpload(uploadId, onComplete);
    }, 100);
  }, [syncUploads, startUpload]);

  /**
   * Clear completed uploads
   */
  const clearCompleted = useCallback(() => {
    console.log('🧹 [useChunkUpload] Clearing completed uploads');
    
    syncUploads((prev) => {
      const updated = new Map(prev);
      Array.from(updated.entries()).forEach(([id, item]) => {
        if (item.status === 'completed') {
          updated.delete(id);
        }
      });
      return updated;
    });
  }, [syncUploads]);

  /**
   * Clear all uploads
   */
  const clearAll = useCallback(() => {
    console.log('🧹 [useChunkUpload] Clearing all uploads');
    
    // Cancel all active uploads
    uploadsRef.current.forEach((item) => {
      if (item.uploader && (item.status === 'uploading' || item.status === 'paused')) {
        item.uploader.cancel();
      }
    });

    syncUploads(() => new Map());
  }, [syncUploads]);

  return {
    uploads: Array.from(uploads.values()),
    addFiles,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    retryUpload,
    clearCompleted,
    clearAll,
    hasUploads: uploads.size > 0,
    hasActiveUploads: Array.from(uploads.values()).some(
      (item) => item.status === 'uploading' || item.status === 'paused'
    ),
  };
};
