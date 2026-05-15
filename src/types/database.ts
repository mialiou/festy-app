export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type FestivalCategory =
  | "Kirchweih"
  | "Music Event"
  | "Folk Festival"
  | "Art Performance"
  | "Seasonal Market"
  | "Food & Wine Tasting"
  | "Parade & Procession"
  | "Historical Reenactment"
  | "Sports Events"
  | "Beer Festival"
  | "Other";

export type FestivalStatus = "active" | "upcoming" | "ended";

export type BeerSize = "0.3L" | "0.5L" | "1L";

export type Fahrgeschaefte =
  | "Karussell"
  | "Autoscooter"
  | "Riesenrad"
  | "Achterbahn"
  | "Kettenkarussell"
  | "Break Dancer"
  | "Geisterbahn"
  | "Schießbude"
  | "Losbude"
  | "Wurfbude"
  | "Backfisch";

export interface Festival {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  category: FestivalCategory;
  location: string;
  city: string | null;
  description: string | null;
  link: string | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  status: FestivalStatus;
  featured: boolean;
  landing_blurb: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  username: string;
  role: "admin" | "sub_admin" | "user";
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  festival_id: string;
  user_id: string;
  join_date: string;
  bierbrauer: string | null;
  beer_name: string | null;
  beer_size: BeerSize | null;
  beer_price: number | null;
  bratwurst_price: number | null;
  rating: number | null;
  comment: string | null;
  senf: string | null;
  ice_cream_price: number | null;
  fahrgeschaefte: string[];
  image_url: string | null;
  featured: boolean;
  landing_blurb: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields (from select with joins)
  festival?: Festival;
  profile?: Profile;
}

export type Database = {
  public: {
    Tables: {
      festivals: {
        Row: Festival;
        Insert: {
          id?: string;
          name: string;
          start_date?: string | null;
          end_date?: string | null;
          category: FestivalCategory;
          location: string;
          city?: string | null;
          description?: string | null;
          link?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          image_url?: string | null;
          status?: FestivalStatus;
          featured?: boolean;
          landing_blurb?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          start_date?: string | null;
          end_date?: string | null;
          category?: FestivalCategory;
          location?: string;
          city?: string | null;
          description?: string | null;
          link?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          image_url?: string | null;
          status?: FestivalStatus;
          featured?: boolean;
          landing_blurb?: string | null;
          updated_at?: string;
        };
      };
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email: string;
          username: string;
          role?: "admin" | "sub_admin" | "user";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          role?: "admin" | "sub_admin" | "user";
          updated_at?: string;
        };
      };
      experiences: {
        Row: Omit<Experience, "festival" | "profile">;
        Insert: {
          id?: string;
          festival_id: string;
          user_id: string;
          join_date?: string;
          bierbrauer?: string | null;
          beer_name?: string | null;
          beer_size?: BeerSize | null;
          beer_price?: number | null;
          bratwurst_price?: number | null;
          rating?: number | null;
          comment?: string | null;
          senf?: string | null;
          ice_cream_price?: number | null;
          fahrgeschaefte?: string[];
          image_url?: string | null;
          featured?: boolean;
          landing_blurb?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          festival_id?: string;
          user_id?: string;
          join_date?: string;
          bierbrauer?: string | null;
          beer_name?: string | null;
          beer_size?: BeerSize | null;
          beer_price?: number | null;
          bratwurst_price?: number | null;
          rating?: number | null;
          comment?: string | null;
          senf?: string | null;
          ice_cream_price?: number | null;
          fahrgeschaefte?: string[];
          image_url?: string | null;
          featured?: boolean;
          landing_blurb?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
