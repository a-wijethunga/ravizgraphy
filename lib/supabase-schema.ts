import { SupabaseClient } from '@supabase/supabase-js'

// Simple in-memory cache to store verified columns for each table
const columnsCache: Record<string, string[]> = {}

export function extractColumnFromError(msg: string, table: string): string | null {
  const regex1 = new RegExp(`column\\s+${table}\\.([^\\s]+)\\s+does\\s+not\\s+exist`, 'i')
  let match = msg.match(regex1)
  if (match) return match[1] || null

  const regex2 = new RegExp(`column\\s+"?([^"\\s]+)"?\\s+of\\s+relation\\s+"?${table}"?\\s+does\\s+not\\s+exist`, 'i')
  match = msg.match(regex2)
  if (match) return match[1] || null

  const regex3 = /column\s+"?([^"\s]+)"?\s+does\s+not\s+exist/i
  match = msg.match(regex3)
  if (match) return match[1] || null

  return null
}

/**
 * Dynamically audit and retrieve columns that actually exist in the table.
 * Caches the result to avoid redundant pre-flight queries.
 */
export async function getExistingColumns(
  supabase: SupabaseClient,
  table: string,
  expectedColumns: string[]
): Promise<string[]> {
  const cacheKey = `${table}:${expectedColumns.join(',')}`
  if (columnsCache[cacheKey]) {
    return columnsCache[cacheKey]
  }

  let columns = [...expectedColumns]
  while (columns.length > 0) {
    const selectStr = columns.join(', ')
    // Use limit(0) so we don't transfer any rows
    const { error } = await supabase.from(table).select(selectStr).limit(0)
    if (!error) {
      columnsCache[cacheKey] = columns
      return columns
    }

    // Check if error is related to missing column
    if (error.code === '42703' || error.message.includes('does not exist')) {
      const missingCol = extractColumnFromError(error.message, table)
      if (missingCol && columns.includes(missingCol)) {
        columns = columns.filter((c) => c !== missingCol)
        continue
      }
      
      // Fallback: search for any expected column inside the error message
      let found = false
      for (const col of columns) {
        if (error.message.includes(col)) {
          columns = columns.filter((c) => c !== col)
          found = true
          break
        }
      }
      if (found) continue
    }

    // If there is some other error or we couldn't parse the column, break
    break
  }

  columnsCache[cacheKey] = columns
  return columns
}

/**
 * Checks if a specific column exists in a table.
 */
export async function hasColumn(
  supabase: SupabaseClient,
  table: string,
  column: string
): Promise<boolean> {
  const existing = await getExistingColumns(supabase, table, [column])
  return existing.includes(column)
}
