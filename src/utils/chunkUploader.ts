/**
 * Chunk Uploader Service
 * Handles file chunking and upload with progress tracking, pause/resume, and retry logic
 * Uses lodash for optimization and utility functions
 */

import times from 'lodash/times';
import chunk from 'lodash/chunk';
import filter from 'lodash/filter';
import map from 'lodash/map';
import countBy from 'lodash/countBy';
import meanBy from 'lodash/meanBy';
import round from 'lodash/round';
import throttle from 'lodash/throttle';
import { apiClient } from '@/api-service/client';
import { FILES_ENDPOINTS } from '@/constants/api';

export interface UploadProgress {
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
  uploadedChunks: number;
  totalChunks: number;
  currentChunkIndex: number;
  speed: number; // bytes per second
  estimatedTimeRemaining: number; // seconds
}

export interface ChunkUploadOptions {
  chunkSize?: number; // Default: 10MB
  maxRetries?: number; // Default: 3
  parallelUploads?: number; // Default: 1 (sequential)
  onProgress?: (progress: UploadProgress) => void;
  onChunkComplete?: (chunkIndex: number) => void;
  onChunkError?: (chunkIndex: number, error: Error) => void;
}

interface ChunkMetadata {
  chunkIndex: number;
  startByte: number;
  endByte: number;
  uploaded: boolean;
  retries: number;
}

export class ChunkUploader {
  private file: File;
  private fileId: string;
  private chunks: ChunkMetadata[] = [];
  private options: Required<ChunkUploadOptions>;
  private isPaused: boolean = false;
  private isCancelled: boolean = false;
  private uploadedBytes: number = 0;
  private startTime: number = 0;
  private token: string = '';

  constructor(file: File, options: ChunkUploadOptions = {}) {
    this.file = file;
    this.fileId = this.generateFileId();
    this.options = {
      chunkSize: options.chunkSize || 10 * 1024 * 1024, // 10MB default
      maxRetries: options.maxRetries || 3,
      parallelUploads: options.parallelUploads || 1,
      onProgress: options.onProgress || (() => {}),
      onChunkComplete: options.onChunkComplete || (() => {}),
      onChunkError: options.onChunkError || (() => {}),
    };

    this.initializeChunks();
  }

  private generateFileId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeChunks(): void {
    const totalChunks = Math.ceil(this.file.size / this.options.chunkSize);

    this.chunks = times(totalChunks, (i) => {
      const startByte = i * this.options.chunkSize;
      const endByte = Math.min(startByte + this.options.chunkSize, this.file.size);

      return {
        chunkIndex: i,
        startByte,
        endByte,
        uploaded: false,
        retries: 0,
      };
    });

    console.log(`📦 [ChunkUploader] Initialized ${totalChunks} chunks for file:`, {
      fileName: this.file.name,
      fileSize: this.file.size,
      chunkSize: this.options.chunkSize,
      totalChunks,
    });
  }

  /**
   * Set authorization token
   * @deprecated Token is now auto-injected via axios interceptor
   */
  setToken(token: string): void {
    this.token = token;
    console.warn('[ChunkUploader] setToken() is deprecated. Token is auto-injected from Redux store.');
  }

  /**
   * Start upload
   */
  async upload(): Promise<{ success: boolean; fileId: string; error?: string }> {
    console.log('⬆️ [ChunkUploader] Starting upload:', this.file.name);

    this.startTime = Date.now();
    this.isPaused = false;
    this.isCancelled = false;

    try {
      // Upload chunks
      if (this.options.parallelUploads > 1) {
        await this.uploadChunksParallel();
      } else {
        await this.uploadChunksSequential();
      }

      // Check if cancelled
      if (this.isCancelled) {
        console.log('❌ [ChunkUploader] Upload cancelled');
        return { success: false, fileId: this.fileId, error: 'Upload cancelled' };
      }

      // Complete upload
      await this.completeUpload();

      console.log('✅ [ChunkUploader] Upload complete:', this.file.name);
      return { success: true, fileId: this.fileId };
    } catch (error) {
      console.error('❌ [ChunkUploader] Upload failed:', error);
      return {
        success: false,
        fileId: this.fileId,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload chunks sequentially using lodash
   */
  private async uploadChunksSequential(): Promise<void> {
    // Get pending chunks using lodash
    const pendingChunks = filter(this.chunks, (c) => !c.uploaded);

    for (const c of pendingChunks) {
      // Check if paused
      while (this.isPaused && !this.isCancelled) {
        await this.sleep(100);
      }

      // Check if cancelled
      if (this.isCancelled) {
        break;
      }

      // Upload chunk with retry
      await this.uploadChunkWithRetry(c);
    }
  }

  /**
   * Upload chunks in parallel using lodash chunk utility
   */
  private async uploadChunksParallel(): Promise<void> {
    // Get pending chunks
    const pendingChunks = filter(this.chunks, (c) => !c.uploaded);
    
    // Split into batches using lodash chunk
    const batches = chunk(pendingChunks, this.options.parallelUploads);

    for (const batch of batches) {
      // Check if cancelled
      if (this.isCancelled) {
        break;
      }

      // Wait if paused
      while (this.isPaused && !this.isCancelled) {
        await this.sleep(100);
      }

      // Upload batch in parallel
      await Promise.all(
        map(batch, (c) => this.uploadChunkWithRetry(c))
      );
    }
  }

  /**
   * Upload single chunk with retry logic
   */
  private async uploadChunkWithRetry(chunk: ChunkMetadata): Promise<void> {
    while (chunk.retries < this.options.maxRetries) {
      try {
        await this.uploadChunk(chunk);
        chunk.uploaded = true;
        this.options.onChunkComplete(chunk.chunkIndex);
        return;
      } catch (error) {
        chunk.retries++;
        console.warn(
          `⚠️ [ChunkUploader] Chunk ${chunk.chunkIndex} failed (retry ${chunk.retries}/${this.options.maxRetries})`,
          error
        );

        if (chunk.retries >= this.options.maxRetries) {
          this.options.onChunkError(chunk.chunkIndex, error as Error);
          throw new Error(`Chunk ${chunk.chunkIndex} failed after ${this.options.maxRetries} retries`);
        }

        // Wait before retry (exponential backoff)
        await this.sleep(Math.pow(2, chunk.retries) * 1000);
      }
    }
  }

  /**
   * Upload single chunk using axios
   */
  private async uploadChunk(chunk: ChunkMetadata): Promise<void> {
    const blob = this.file.slice(chunk.startByte, chunk.endByte);

    const formData = new FormData();
    formData.append('chunk', blob);
    formData.append('chunkIndex', chunk.chunkIndex.toString());
    formData.append('totalChunks', this.chunks.length.toString());
    formData.append('fileId', this.fileId);
    formData.append('fileName', this.file.name);
    formData.append('fileSize', this.file.size.toString());
    formData.append('mimeType', this.file.type);

    // Use axios client (auto token injection via interceptor)
    const response = await apiClient.upload(FILES_ENDPOINTS.UPLOAD_CHUNK, formData);

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(response.error || `HTTP ${response.status}`);
    }

    // Update progress
    this.uploadedBytes += chunk.endByte - chunk.startByte;
    this.updateProgress();
  }

  /**
   * Complete upload (assemble chunks on backend) using axios
   */
  private async completeUpload(): Promise<void> {
    console.log('🔄 [ChunkUploader] Completing upload...');

    const response = await apiClient.post(FILES_ENDPOINTS.UPLOAD_COMPLETE, {
      fileId: this.fileId,
      fileName: this.file.name,
      fileSize: this.file.size,
      mimeType: this.file.type,
      totalChunks: this.chunks.length,
    });

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(response.error || 'Failed to complete upload');
    }

    console.log('✅ [ChunkUploader] Upload completed successfully');
  }

  /**
   * Update and emit progress using lodash
   * Throttled to prevent excessive updates
   */
  private updateProgress = throttle((): void => {
    // Count uploaded chunks using lodash
    const uploadedChunks = countBy(this.chunks, 'uploaded').true || 0;
    const percentage = (this.uploadedBytes / this.file.size) * 100;
    const elapsedTime = (Date.now() - this.startTime) / 1000; // seconds
    const speed = this.uploadedBytes / elapsedTime; // bytes per second
    const remainingBytes = this.file.size - this.uploadedBytes;
    const estimatedTimeRemaining = speed > 0 ? remainingBytes / speed : 0;

    const progress: UploadProgress = {
      uploadedBytes: this.uploadedBytes,
      totalBytes: this.file.size,
      percentage: round(percentage, 2), // Round using lodash
      uploadedChunks,
      totalChunks: this.chunks.length,
      currentChunkIndex: uploadedChunks,
      speed: round(speed, 2), // Round using lodash
      estimatedTimeRemaining: round(estimatedTimeRemaining, 2), // Round using lodash
    };

    this.options.onProgress(progress);
  }, 100); // Throttle to 100ms

  /**
   * Pause upload
   */
  pause(): void {
    console.log('⏸️ [ChunkUploader] Upload paused');
    this.isPaused = true;
  }

  /**
   * Resume upload
   */
  resume(): void {
    console.log('▶️ [ChunkUploader] Upload resumed');
    this.isPaused = false;
  }

  /**
   * Cancel upload
   */
  cancel(): void {
    console.log('⏹️ [ChunkUploader] Upload cancelled');
    this.isCancelled = true;
  }

  /**
   * Get current upload status using lodash
   */
  getStatus(): {
    isPaused: boolean;
    isCancelled: boolean;
    uploadedChunks: number;
    totalChunks: number;
    percentage: number;
    failedChunks: number;
    avgRetries: number;
  } {
    const uploadedChunks = countBy(this.chunks, 'uploaded').true || 0;
    const failedChunks = filter(
      this.chunks,
      (c) => c.retries >= this.options.maxRetries && !c.uploaded
    ).length;
    const avgRetries = meanBy(this.chunks, 'retries') || 0;

    return {
      isPaused: this.isPaused,
      isCancelled: this.isCancelled,
      uploadedChunks,
      totalChunks: this.chunks.length,
      percentage: round((this.uploadedBytes / this.file.size) * 100, 2),
      failedChunks,
      avgRetries: round(avgRetries, 2),
    };
  }

  /**
   * Helper: Sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
