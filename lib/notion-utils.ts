import { NotionProperty } from './types'

/**
 * Get the plain_text field from a property
 * @param property - Notion property
 * @returns The plain_text field from property
 */
export function getPlainText(property: NotionProperty): string | null {
  if (typeof property.rich_text !== 'undefined') {
    return property.rich_text[0].plain_text
  }
  return null
}
