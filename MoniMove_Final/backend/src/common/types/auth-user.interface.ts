export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  avatar: string;
  role: 'user' | 'admin';
  deviceIds: string[];
}

export interface UserProfile {
  email: string;
  name: string;
  avatar: string;
  role: 'user' | 'admin';
  deviceIds: string[];
  createdAt: string;
}
