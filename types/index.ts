import { Timestamp } from 'firebase/firestore';

// Agregamos 'user' que faltaba aquí
export type UserRole = 'admin' | 'monitoreo' | 'user'; 

export type AppView =
  | 'login'
  | 'dashboard'
  | 'users'
  | 'reports'
  | 'analytics';

export type ViewState = AppView;

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface AlertData {
  id: string;
  userName: string;
  userDni?: string;
  userPhone?: string;
  type: string;
  status: string;
  location: LocationData;
  timestamp: Timestamp | Date | null;
  userId?: string;
}
export interface AppUser {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  dni: string;
  phone: string;
  role: UserRole; 
  status?: 'active' | 'disabled'; 
  createdAt?: Timestamp | Date | string | null;
  gender?: string;
}