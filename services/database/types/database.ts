
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "event_private": {
                  Row: {
                    "attendee_info": string | null,"event_id": string,"online_url": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attendee_info"?: string | null,"event_id": string,"online_url"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "attendee_info"?: string | null,"event_id"?: string,"online_url"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "event_private_event_id_fkey"
      columns: ["event_id"]
isOneToOne: true
      referencedRelation: "event_attendance"
      referencedColumns: ["event_id"]
    },{
      foreignKeyName: "event_private_event_id_fkey"
      columns: ["event_id"]
isOneToOne: true
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                },"events": {
                  Row: {
                    "address": string | null,"capacity": number | null,"category": Database["public"]['Enums']["event_category"],"city": string | null,"country": string | null,"cover_image_url": string | null,"created_at": string,"currency": string,"description": string | null,"ends_at": string,"host_id": string,"id": string,"is_online": boolean,"published_at": string | null,"refund_policy": string | null,"slug": string,"starts_at": string,"status": Database["public"]['Enums']["event_status"],"summary": string | null,"timezone": string,"title": string,"updated_at": string,"venue_name": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: string | null,"capacity"?: number | null,"category"?: Database["public"]['Enums']["event_category"],"city"?: string | null,"country"?: string | null,"cover_image_url"?: string | null,"created_at"?: string,"currency"?: string,"description"?: string | null,"ends_at": string,"host_id": string,"id"?: string,"is_online"?: boolean,"published_at"?: string | null,"refund_policy"?: string | null,"slug": string,"starts_at": string,"status"?: Database["public"]['Enums']["event_status"],"summary"?: string | null,"timezone"?: string,"title": string,"updated_at"?: string,"venue_name"?: string | null
                  }
                  Update: {
                    "address"?: string | null,"capacity"?: number | null,"category"?: Database["public"]['Enums']["event_category"],"city"?: string | null,"country"?: string | null,"cover_image_url"?: string | null,"created_at"?: string,"currency"?: string,"description"?: string | null,"ends_at"?: string,"host_id"?: string,"id"?: string,"is_online"?: boolean,"published_at"?: string | null,"refund_policy"?: string | null,"slug"?: string,"starts_at"?: string,"status"?: Database["public"]['Enums']["event_status"],"summary"?: string | null,"timezone"?: string,"title"?: string,"updated_at"?: string,"venue_name"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "events_host_id_fkey"
      columns: ["host_id"]
isOneToOne: false
      referencedRelation: "hosts"
      referencedColumns: ["id"]
    }
                  ]
                },"hosts": {
                  Row: {
                    "bio": string | null,"created_at": string,"id": string,"name": string,"slug": string,"stripe_account_id": string | null,"stripe_details_submitted": boolean,"stripe_payouts_enabled": boolean,"stripe_transfers_enabled": boolean,"updated_at": string,"user_id": string,"website": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "bio"?: string | null,"created_at"?: string,"id"?: string,"name": string,"slug": string,"stripe_account_id"?: string | null,"stripe_details_submitted"?: boolean,"stripe_payouts_enabled"?: boolean,"stripe_transfers_enabled"?: boolean,"updated_at"?: string,"user_id": string,"website"?: string | null
                  }
                  Update: {
                    "bio"?: string | null,"created_at"?: string,"id"?: string,"name"?: string,"slug"?: string,"stripe_account_id"?: string | null,"stripe_details_submitted"?: boolean,"stripe_payouts_enabled"?: boolean,"stripe_transfers_enabled"?: boolean,"updated_at"?: string,"user_id"?: string,"website"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"order_items": {
                  Row: {
                    "id": string,"order_id": string,"quantity": number,"ticket_type_id": string,"unit_price": number
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"order_id": string,"quantity": number,"ticket_type_id": string,"unit_price": number
                  }
                  Update: {
                    "id"?: string,"order_id"?: string,"quantity"?: number,"ticket_type_id"?: string,"unit_price"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_items_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_ticket_type_id_fkey"
      columns: ["ticket_type_id"]
isOneToOne: false
      referencedRelation: "ticket_type_availability"
      referencedColumns: ["ticket_type_id"]
    },{
      foreignKeyName: "order_items_ticket_type_id_fkey"
      columns: ["ticket_type_id"]
isOneToOne: false
      referencedRelation: "ticket_types"
      referencedColumns: ["id"]
    }
                  ]
                },"orders": {
                  Row: {
                    "buyer_email": string | null,"buyer_name": string | null,"completed_at": string | null,"confirmation_sent_at": string | null,"created_at": string,"currency": string,"event_id": string,"expires_at": string | null,"id": string,"platform_fee": number,"refunded_at": string | null,"status": Database["public"]['Enums']["order_status"],"stripe_checkout_session_id": string | null,"stripe_payment_intent_id": string | null,"total": number,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "buyer_email"?: string | null,"buyer_name"?: string | null,"completed_at"?: string | null,"confirmation_sent_at"?: string | null,"created_at"?: string,"currency": string,"event_id": string,"expires_at"?: string | null,"id"?: string,"platform_fee"?: number,"refunded_at"?: string | null,"status"?: Database["public"]['Enums']["order_status"],"stripe_checkout_session_id"?: string | null,"stripe_payment_intent_id"?: string | null,"total": number,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "buyer_email"?: string | null,"buyer_name"?: string | null,"completed_at"?: string | null,"confirmation_sent_at"?: string | null,"created_at"?: string,"currency"?: string,"event_id"?: string,"expires_at"?: string | null,"id"?: string,"platform_fee"?: number,"refunded_at"?: string | null,"status"?: Database["public"]['Enums']["order_status"],"stripe_checkout_session_id"?: string | null,"stripe_payment_intent_id"?: string | null,"total"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "orders_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "event_attendance"
      referencedColumns: ["event_id"]
    },{
      foreignKeyName: "orders_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar_hue": number | null,"avatar_icon": string | null,"avatar_url": string | null,"bio": string | null,"created_at": string,"display_name": string | null,"id": string,"signup_site": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_hue"?: number | null,"avatar_icon"?: string | null,"avatar_url"?: string | null,"bio"?: string | null,"created_at"?: string,"display_name"?: string | null,"id"?: string,"signup_site"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "avatar_hue"?: number | null,"avatar_icon"?: string | null,"avatar_url"?: string | null,"bio"?: string | null,"created_at"?: string,"display_name"?: string | null,"id"?: string,"signup_site"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"ticket_types": {
                  Row: {
                    "created_at": string,"description": string | null,"event_id": string,"id": string,"is_hidden": boolean,"max_per_order": number,"name": string,"price": number,"quantity": number | null,"sales_end": string | null,"sales_start": string | null,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"event_id": string,"id"?: string,"is_hidden"?: boolean,"max_per_order"?: number,"name": string,"price"?: number,"quantity"?: number | null,"sales_end"?: string | null,"sales_start"?: string | null,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"event_id"?: string,"id"?: string,"is_hidden"?: boolean,"max_per_order"?: number,"name"?: string,"price"?: number,"quantity"?: number | null,"sales_end"?: string | null,"sales_start"?: string | null,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "ticket_types_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "event_attendance"
      referencedColumns: ["event_id"]
    },{
      foreignKeyName: "ticket_types_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                },"tickets": {
                  Row: {
                    "attendee_name": string | null,"checked_in_at": string | null,"code": string,"created_at": string,"event_id": string,"id": string,"order_id": string,"status": Database["public"]['Enums']["ticket_status"],"ticket_type_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attendee_name"?: string | null,"checked_in_at"?: string | null,"code"?: string,"created_at"?: string,"event_id": string,"id"?: string,"order_id": string,"status"?: Database["public"]['Enums']["ticket_status"],"ticket_type_id": string,"user_id": string
                  }
                  Update: {
                    "attendee_name"?: string | null,"checked_in_at"?: string | null,"code"?: string,"created_at"?: string,"event_id"?: string,"id"?: string,"order_id"?: string,"status"?: Database["public"]['Enums']["ticket_status"],"ticket_type_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "tickets_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "event_attendance"
      referencedColumns: ["event_id"]
    },{
      foreignKeyName: "tickets_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "tickets_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "tickets_ticket_type_id_fkey"
      columns: ["ticket_type_id"]
isOneToOne: false
      referencedRelation: "ticket_type_availability"
      referencedColumns: ["ticket_type_id"]
    },{
      foreignKeyName: "tickets_ticket_type_id_fkey"
      columns: ["ticket_type_id"]
isOneToOne: false
      referencedRelation: "ticket_types"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "event_attendance": {
                  Row: {
                    "event_id": string | null,"going": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                },"ticket_type_availability": {
                  Row: {
                    "event_id": string | null,"sold": number | null,"taken": number | null,"ticket_type_id": string | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "ticket_types_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "event_attendance"
      referencedColumns: ["event_id"]
    },{
      foreignKeyName: "ticket_types_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Functions: {
            "check_in_ticket":
{ Args: { "p_code": string,"p_event_id": string,"p_undo"?: boolean }; Returns: {
              "attendee_name": string | null,
"checked_in_at": string | null,
"code": string,
"created_at": string,
"event_id": string,
"id": string,
"order_id": string,
"status": Database["public"]['Enums']["ticket_status"],
"ticket_type_id": string,
"user_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "tickets"
        isOneToOne: true
        isSetofReturn: false
      } },
"complete_order":
{ Args: { "p_order_id": string,"p_payment_intent_id"?: string }; Returns: boolean
                           },
"create_order":
{ Args: { "p_buyer_email"?: string,"p_buyer_name"?: string,"p_event_id": string,"p_hold"?: string,"p_items": Json,"p_user_id": string }; Returns: string
                           },
"is_event_host":
{ Args: { "p_event_id": string }; Returns: boolean
                           },
"is_host":
{ Args: { "p_host_id": string }; Returns: boolean
                           },
"void_order":
{ Args: { "p_order_id": string,"p_refunded": boolean }; Returns: boolean
                           }
          }
          Enums: {
            "event_category": "cupping"|"throwdown"|"festival"|"workshop"|"competition"|"meetup"|"class"|"other","event_status": "draft"|"published"|"cancelled","order_status": "pending"|"completed"|"expired"|"cancelled"|"refunded","ticket_status": "valid"|"void"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "event_category": ["cupping", "throwdown", "festival", "workshop", "competition", "meetup", "class", "other"],"event_status": ["draft", "published", "cancelled"],"order_status": ["pending", "completed", "expired", "cancelled", "refunded"],"ticket_status": ["valid", "void"]
          }
        }
} as const
