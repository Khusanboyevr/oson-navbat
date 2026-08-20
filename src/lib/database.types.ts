/**
 * Hand-written to match the shape `supabase gen types typescript` produces,
 * so swapping this file for a CLI-generated one later is a drop-in replacement.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "client" | "barber" | "superadmin";
export type BarberStatus = "active" | "blocked";
export type BarberCategory = "erkaklar" | "ayollar" | "bolalar";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone: string | null;
          name: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          phone?: string | null;
          name?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          phone?: string | null;
          name?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      barbers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          specialty: string;
          category: BarberCategory;
          status: BarberStatus;
          avatar: string | null;
          bio: string | null;
          rating: number;
          location: string | null;
          lat: number | null;
          lng: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          specialty: string;
          category?: BarberCategory;
          status?: BarberStatus;
          avatar?: string | null;
          bio?: string | null;
          rating?: number;
          location?: string | null;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          specialty?: string;
          category?: BarberCategory;
          status?: BarberStatus;
          avatar?: string | null;
          bio?: string | null;
          rating?: number;
          location?: string | null;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "barbers_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          client_id: string;
          barber_id: string;
          date: string;
          time: string;
          service: string;
          price: number;
          status: BookingStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          barber_id: string;
          date: string;
          time: string;
          service: string;
          price: number;
          status?: BookingStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          barber_id?: string;
          date?: string;
          time?: string;
          service?: string;
          price?: number;
          status?: BookingStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey";
            columns: ["client_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_barber_id_fkey";
            columns: ["barber_id"];
            referencedRelation: "barbers";
            referencedColumns: ["id"];
          },
        ];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      barber_status: BarberStatus;
      barber_category: BarberCategory;
      booking_status: BookingStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

/** Convenience row-type accessor, e.g. `Tables<"barbers">`. */
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];
