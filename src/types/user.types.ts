export type UserRole = 'manager' | 'supervisor' | 'warehouse_keeper';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}
