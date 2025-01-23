export type WikiArticle = {
  id: number
  title: string
  subtitle: string
  content: string
  slug: string
  tags: string
  category_id: number
  group_id: string
  created_at: string
  updated_at: string
  category: WikiCategory
}

export type WikiCategory = {
  id: number
  title: string
  slug: string
  description: string
  created_at: string
  updated_at: string
  is_documentation: boolean
}
