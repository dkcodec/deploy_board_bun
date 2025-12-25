export const normalizeSlug = (slug: string) => {
  return slug.trim().toLowerCase()
}

export const normalizeKey = (key: string) => {
  return key.trim().toUpperCase()
}
