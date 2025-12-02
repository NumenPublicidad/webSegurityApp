import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'monitoreo';


export type AppView =
  | 'login'
  | 'dashboard'
  | 'users'
  | 'reports';


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
