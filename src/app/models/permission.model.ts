// src/app/models/permission.model.ts
export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  type: string;
  approval_levels: number;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
  pivot?: {
    model_type: string;
    model_id: number;
    role_id: number;
  };
}

export interface User {
  id: number;
  name: string;
  nameArabic: string | null;
  email: string;
  termsAccepted: number;
  status: string;
  roles: Role[];
  permissions: Permission[];
  profile: any;
  communication: any;
  passport: any;
  address: any;
  qatarInfo: any;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}