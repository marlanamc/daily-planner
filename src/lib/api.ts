import { supabase } from './supabase'

interface ImportantDate {
  id: string
  date: string
  description: string
  created_at: string
}

export const addImportantDate = async (date: Date, description: string) => {
  const { data, error } = await supabase
    .from('important_dates')
    .insert([
      {
        date: date.toISOString().split('T')[0],
        description,
        user_id: supabase.auth.getUser().then(({ data }) => data.user?.id)
      }
    ])
    .select()

  if (error) throw error
  return data
}

export const getImportantDates = async () => {
  const { data, error } = await supabase
    .from('important_dates')
    .select('*')
    .order('date', { ascending: true })

  if (error) throw error
  return data as ImportantDate[]
} 