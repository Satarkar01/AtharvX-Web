import { LucideIcon } from 'lucide-react';

export type UserRole = 'patient' | 'doctor' | 'hospital' | 'admin';

export interface User {
  id: string;
  username: string;
  fullName: string;
  passwordHash: string;
  role: UserRole;
  isVerified: boolean;
  isSuspended: boolean;
  strikes: number;
  createdAt: string;
  roleChangeRequest?: {
    requestedRole: UserRole;
    reason: string;
    proofId: string;
    status: 'pending' | 'approved' | 'rejected';
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  adminId: string;
  targetUserId?: string;
  details: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface Treatment {
  id: string;
  name: string;
  baseCost: number;
}

export interface HospitalData {
  id: string;
  name: string;
  district: 'Mumbai' | 'Pune' | 'Kolhapur';
  address: string;
  rating: number;
  treatments: {
    treatmentId: string;
    cost: number;
  }[];
  mapsUrl: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  district: 'Mumbai' | 'Pune' | 'Kolhapur';
  address: string;
  rating: number;
  discount: number; // e.g., 10 for 10%
  hasHomeDelivery: boolean;
  mapsUrl: string;
}

export interface MedicineOrder {
  id: string;
  userId: string;
  userName: string;
  pharmacyId: string;
  pharmacyName: string;
  prescriptionImage: string; // base64 or placeholder
  status: 'pending' | 'processing' | 'out-for-delivery' | 'delivered';
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface AIResult {
  symptoms: string[];
  possibleConditions: string[];
  urgency: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface NavItem {
  label: string;
  icon: LucideIcon;
  role?: UserRole;
  onClick: () => void;
}
