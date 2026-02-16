/**
 * Files Store Types
 */

import { FileItem } from '@/api-service';

export interface FilesState {
  items: FileItem[];
  loadingCount: number;
  uploadingFileId: string | null;
  deletingFileId: string | null;
}

