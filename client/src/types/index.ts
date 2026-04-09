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
  selectionMode: 'single' | 'multiple';
  isFinalized: boolean;
  hasDeliveryPassword: boolean;
  createdAt: string;
  photos: Photo[];
  deliveryPhotos: Photo[];
}

export interface DeliveryInfo {
  id: string;
  name: string;
  clientName: string;
  hasDeliveryPassword: boolean;
  photoCount: number;
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
  selectionMode: 'single' | 'multiple';
  isFinalized: boolean;
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
  email: string;
  name: string;
  verified: boolean;
  brandName: string;
  bio: string;
  profileImage: string | null;
  location: string;
  socialLink: string;
  slug: string;
}
