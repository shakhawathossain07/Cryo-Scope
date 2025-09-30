import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://siaxwbhyahlshwqzvafe.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpYXh3Ymh5YWhsc2h3cXp2YWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjYwMzAsImV4cCI6MjA3NDc0MjAzMH0.PfjNCyUdsK7oqMeAPNF60DyPQyCeZGIj8aQe5tRQTOA'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database Types (you can extend these based on your actual Supabase schema)
export interface PermafrostData {
  id?: string
  latitude: number
  longitude: number
  temperature: number
  depth: number
  methane_levels?: number
  timestamp: string
  created_at?: string
}

export interface RiskAssessment {
  id?: string
  region: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_factors: string[]
  mitigation_strategies: string[]
  last_updated: string
  created_at?: string
}

export interface PredictionResult {
  id?: string
  prediction_type: 'methane_hotspot' | 'permafrost_thaw' | 'temperature_trend'
  location: {
    latitude: number
    longitude: number
  }
  predicted_value: number
  confidence_score: number
  prediction_date: string
  model_version: string
  created_at?: string
}

// Database service functions
export class SupabaseService {
  static async getPermafrostData(limit = 100) {
    const { data, error } = await supabase
      .from('permafrost_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data as PermafrostData[]
  }

  static async addPermafrostData(data: Omit<PermafrostData, 'id' | 'created_at'>) {
    const { data: result, error } = await supabase
      .from('permafrost_data')
      .insert([data])
      .select()
    
    if (error) throw error
    return result[0] as PermafrostData
  }

  static async getRiskAssessments() {
    const { data, error } = await supabase
      .from('risk_assessments')
      .select('*')
      .order('last_updated', { ascending: false })
    
    if (error) throw error
    return data as RiskAssessment[]
  }

  static async updateRiskAssessment(id: string, updates: Partial<RiskAssessment>) {
    const { data, error } = await supabase
      .from('risk_assessments')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0] as RiskAssessment
  }

  static async getPredictions(type?: string) {
    let query = supabase
      .from('predictions')
      .select('*')
      .order('prediction_date', { ascending: false })
    
    if (type) {
      query = query.eq('prediction_type', type)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data as PredictionResult[]
  }

  static async addPrediction(prediction: Omit<PredictionResult, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('predictions')
      .insert([prediction])
      .select()
    
    if (error) throw error
    return data[0] as PredictionResult
  }

  // Real-time subscriptions
  static subscribeToPermafrostData(callback: (payload: any) => void) {
    return supabase
      .channel('permafrost_data_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'permafrost_data' }, 
        callback
      )
      .subscribe()
  }

  static subscribeToRiskAssessments(callback: (payload: any) => void) {
    return supabase
      .channel('risk_assessments_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'risk_assessments' }, 
        callback
      )
      .subscribe()
  }
}