const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://mondai-app.com',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: [
    '/api/*',
    '/admin/*',
    '/server-sitemap.xml',
    '/auth',
    '/auth/*',
    '/commentators/create',
    '/statements/create'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/*', '/admin/*', '/auth/*', '/commentators/create', '/statements/create']
      }
    ]
  },
  additionalPaths: async (config) => {
    const result = []

    try {
      // Statements
      const { data: statements, error: statementsError } = await supabase
        .from('statements')
        .select('id')
        .limit(10000)
      
      console.log('Statements:', statements?.length || 0, 'Error:', statementsError)
      
      if (statements) {
        statements.forEach((statement) => {
          result.push({
            loc: `/statements/${statement.id}`,
            changefreq: 'daily',
            priority: 0.8,
            lastmod: new Date().toISOString()
          })
        })
      }

      // Tags (Topics)
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('id')
        .limit(10000)
      
      console.log('Tags:', tags?.length || 0, 'Error:', tagsError)
      
      if (tags) {
        tags.forEach((tag) => {
          result.push({
            loc: `/topics/${tag.id}`,
            changefreq: 'weekly',
            priority: 0.7,
            lastmod: new Date().toISOString()
          })
        })
      }

      // Politicians (speakers with type 1)
      const allPoliticians = await fetchAllPoliticians()
      
      console.log('Politicians:', allPoliticians?.length || 0)
      
      if (allPoliticians) {
        allPoliticians.forEach((politician) => {
          result.push({
            loc: `/politicians/${politician.id}`,
            changefreq: 'weekly',
            priority: 0.7,
            lastmod: new Date().toISOString()
          })
        })
      }

      // Commentators (speakers with type other than 1)
      const { data: commentators, error: commentatorsError } = await supabase
        .from('speakers')
        .select('id')
        .neq('speaker_type', 1)
        .limit(10000)
      
      console.log('Commentators:', commentators?.length || 0, 'Error:', commentatorsError)
      
      if (commentators) {
        commentators.forEach((commentator) => {
          result.push({
            loc: `/commentators/${commentator.id}`,
            changefreq: 'weekly',
            priority: 0.7,
            lastmod: new Date().toISOString()
          })
        })
      }

      // Parties
      const { data: parties, error: partiesError } = await supabase
        .from('parties')
        .select('id')
        .limit(10000)
      
      console.log('Parties:', parties?.length || 0, 'Error:', partiesError)
      
      if (parties) {
        parties.forEach((party) => {
          result.push({
            loc: `/parties/${party.id}`,
            changefreq: 'weekly',
            priority: 0.7,
            lastmod: new Date().toISOString()
          })
        })
      }

      console.log('Total URLs:', result.length)
    } catch (error) {
      console.error('Error in additionalPaths:', error)
    }

    return result
  }
}

const fetchAllPoliticians = async () => {
  let allPoliticians = []
  let page = 0
  const pageSize = 1000
  
  while (true) {
    const { data, error } = await supabase
      .from('speakers')
      .select('id')
      .eq('speaker_type', 1)
      .range(page * pageSize, (page + 1) * pageSize - 1)
    
    if (error || !data || data.length === 0) break
    
    allPoliticians = [...allPoliticians, ...data]
    page++
  }
  
  return allPoliticians
} 