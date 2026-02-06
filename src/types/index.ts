export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: "admin" | "cleaner";
  avatar_url: string | null;
  is_active: boolean;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  geofence_radius: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  cleaner_id: string;
  location_id: string;
  is_active: boolean;
  created_at: string;
}

export interface Checkin {
  id: string;
  cleaner_id: string;
  location_id: string;
  checkin_time: string;
  checkin_lat: number;
  checkin_lng: number;
  checkin_within_geofence: boolean;
  checkout_time: string | null;
  checkout_lat: number | null;
  checkout_lng: number | null;
  checkout_within_geofence: boolean | null;
  remarks: string | null;
  status: "checked_in" | "checked_out";
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  is_default: boolean;
  location_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface CheckoutTask {
  id: string;
  checkin_id: string;
  checklist_item_id: string;
  is_completed: boolean;
}

export interface CheckoutPhoto {
  id: string;
  checkin_id: string;
  photo_url: string;
  created_at: string;
}

export interface Invitation {
  id: string;
  email: string;
  token: string;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface AppSettings {
  id: string;
  company_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  default_geofence_radius: number;
  notify_on_checkin: boolean;
  notify_on_checkout: boolean;
  updated_at: string;
}
