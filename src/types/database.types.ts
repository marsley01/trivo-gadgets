export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          stock: number
          category: string | null
          image_url: string | null
          is_featured: boolean
          seo_title: string | null
          seo_description: string | null
          focus_keyword: string | null
          vendor_id: string | null
          cj_product_id: string | null
          brand: string | null
          features: Json
          specifications: Json
          tags: Json
          material: string | null
          weight: string | null
          dimensions: string | null
          variants: Json
          variant_options: Json
          long_description: string | null
          secondary_keywords: string | null
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          stock?: number
          category?: string | null
          image_url?: string | null
          is_featured?: boolean
          seo_title?: string | null
          seo_description?: string | null
          focus_keyword?: string | null
          vendor_id?: string | null
          cj_product_id?: string | null
          brand?: string | null
          features?: Json
          specifications?: Json
          tags?: Json
          material?: string | null
          weight?: string | null
          dimensions?: string | null
          variants?: Json
          variant_options?: Json
          long_description?: string | null
          secondary_keywords?: string | null
          slug?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          stock?: number
          category?: string | null
          image_url?: string | null
          is_featured?: boolean
          seo_title?: string | null
          seo_description?: string | null
          focus_keyword?: string | null
          vendor_id?: string | null
          cj_product_id?: string | null
          brand?: string | null
          features?: Json
          specifications?: Json
          tags?: Json
          material?: string | null
          weight?: string | null
          dimensions?: string | null
          variants?: Json
          variant_options?: Json
          long_description?: string | null
          secondary_keywords?: string | null
          slug?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          }
        ]
      }
      subscribers: {
        Row: {
          id: string
          email: string
          subscribed_at: string
        }
        Insert: {
          id?: string
          email: string
          subscribed_at?: string
        }
        Update: {
          id?: string
          email?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          customer_id: string
          items: Json
          total: number
          status: string
          whatsapp_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          items: Json
          total: number
          status?: string
          whatsapp_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          items?: Json
          total?: number
          status?: string
          whatsapp_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      notification_subscriptions: {
        Row: {
          id: string
          customer_id: string
          subscription: Json
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          subscription: Json
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          subscription?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      admin_users: {
        Row: {
          id: string
          email: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          created_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          customer_name: string
          rating: number
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          customer_name: string
          rating: number
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          customer_name?: string
          rating?: number
          text?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      vendors: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          business_name: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          business_name?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          business_name?: string | null
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          cover_image_url: string | null
          published_at: string
          seo_title: string | null
          seo_description: string | null
          related_product_ids: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          excerpt?: string | null
          cover_image_url?: string | null
          published_at?: string
          seo_title?: string | null
          seo_description?: string | null
          related_product_ids?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          cover_image_url?: string | null
          published_at?: string
          seo_title?: string | null
          seo_description?: string | null
          related_product_ids?: string[] | null
          created_at?: string
        }
        Relationships: []
      }
      admin_orders: {
        Row: {
          id: string
          receipt_number: string
          customer_name: string
          customer_phone: string
          customer_email: string | null
          items: Json
          subtotal: number
          delivery_fee: number
          total: number
          mpesa_reference: string
          vendor_id: string | null
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          receipt_number: string
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          items: Json
          subtotal: number
          delivery_fee?: number
          total: number
          mpesa_reference: string
          vendor_id?: string | null
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          receipt_number?: string
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          items?: Json
          subtotal?: number
          delivery_fee?: number
          total?: number
          mpesa_reference?: string
          vendor_id?: string | null
          status?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          }
        ]
      }
      hero_slides: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          badge: string | null
          cta_label: string | null
          cta_url: string | null
          image_url: string
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          badge?: string | null
          cta_label?: string | null
          cta_url?: string | null
          image_url: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          badge?: string | null
          cta_label?: string | null
          cta_url?: string | null
          image_url?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      exec_sql: {
        Args: {
          query: string
        }
        Returns: undefined
      }
    }
  }
}
