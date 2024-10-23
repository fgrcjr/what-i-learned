import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://lmxhhballotobjkzlyrw.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxteGhoYmFsbG90b2Jqa3pseXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2NTk1NjksImV4cCI6MjA0NTIzNTU2OX0.nxAqZk1I8yg3nzdvnHFEQ_-r2atNx66unJ13x-IbHj4"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})