export interface Photo {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  order: number;
}

export interface Gallery {
  id: string;
  name: string;
  clientName: string;
  slug: string;
  hasPassword: boolean;
  maxSelections: number;
  status: 'active' | 'closed';
  createdAt: string;
  photos: Photo[];
}

export interface GalleryPublicInfo {
  id: string;
  name: string;
  clientName: string;
  hasPassword: boolean;
  maxSelections: number;
  status: 'active' | 'closed';
  photoCount: number;
}

export interface Selection {
  id: string;
  galleryId: string;
  galleryName: string;
  clientName: string;
  selectedPhotos: string[];
  selectedPhotoDetails: { id: string; originalName: string; filename: string }[];
  note: string;
  submittedAt: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
}
