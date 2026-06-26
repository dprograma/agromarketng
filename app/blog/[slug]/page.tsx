import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Calendar, User, Clock, ArrowLeft, Tag } from 'lucide-react'
import { blogPosts, getPostBySlug } from '@/lib/blog-posts'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  return {
    title: `${post.title} | AgroMarket NG Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://www.agromarketng.com/blog/${slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
    alternates: {
      canonical: `https://www.agromarketng.com/blog/${slug}`,
    },
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  Technology: 'bg-blue-100 text-blue-800',
  'Farming Tips': 'bg-green-100 text-green-800',
  Business: 'bg-purple-100 text-purple-800',
  'Sustainable Farming': 'bg-teal-100 text-teal-800',
  'Crop Management': 'bg-yellow-100 text-yellow-800',
  Finance: 'bg-orange-100 text-orange-800',
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) notFound()

  const relatedPosts = blogPosts
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 2)

  const colorClass = CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-800'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author,
      jobTitle: post.authorRole,
    },
    publisher: {
      '@type': 'Organization',
      name: 'AgroMarket Nigeria',
      url: 'https://www.agromarketng.com',
    },
    datePublished: post.date,
    mainEntityOfPage: `https://www.agromarketng.com/blog/${slug}`,
  }

  const paragraphs = post.content.split('\n\n')

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-grow">
        {/* Hero */}
        <div className="bg-gradient-to-r from-green-900 to-green-700 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/blog"
              className="inline-flex items-center text-green-200 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>

            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${colorClass}`}>
              {post.category}
            </span>

            <h1 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-green-200">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {post.author} · {post.authorRole}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:text-gray-900">
            {paragraphs.map((block, i) => {
              if (block.startsWith('## ')) {
                return (
                  <h2 key={i} className="text-2xl font-bold text-gray-900 mt-10 mb-4">
                    {block.replace('## ', '')}
                  </h2>
                )
              }
              if (block.startsWith('- ')) {
                const items = block.split('\n').filter((l) => l.startsWith('- '))
                return (
                  <ul key={i} className="list-disc pl-6 space-y-2 my-4">
                    {items.map((item, j) => {
                      const parts = item.replace('- ', '').split('**')
                      return (
                        <li key={j} className="text-gray-700">
                          {parts.map((part, k) =>
                            k % 2 === 1 ? (
                              <strong key={k} className="text-gray-900">
                                {part}
                              </strong>
                            ) : (
                              part
                            )
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )
              }
              if (/^\d+\./.test(block)) {
                const items = block.split('\n').filter((l) => /^\d+\./.test(l))
                return (
                  <ol key={i} className="list-decimal pl-6 space-y-2 my-4">
                    {items.map((item, j) => (
                      <li key={j} className="text-gray-700">
                        {item.replace(/^\d+\.\s*/, '')}
                      </li>
                    ))}
                  </ol>
                )
              }
              if (block.trim() === '') return null
              const parts = block.split('**')
              return (
                <p key={i} className="text-gray-700 leading-relaxed mb-4">
                  {parts.map((part, k) =>
                    k % 2 === 1 ? (
                      <strong key={k} className="text-gray-900">
                        {part}
                      </strong>
                    ) : (
                      part
                    )
                  )}
                </p>
              )
            })}
          </div>

          {/* CTA */}
          <div className="mt-10 bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <Tag className="w-8 h-8 text-green-700 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Ready to buy or sell agricultural products?
            </h3>
            <p className="text-gray-600 mb-4">
              Join thousands of farmers and buyers on Nigeria&apos;s fastest-growing agro marketplace.
            </p>
            <Link
              href="/products"
              className="inline-block bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
            >
              Browse Listings
            </Link>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Related Articles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow group"
                  >
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mb-3 ${CATEGORY_COLORS[related.category] ?? 'bg-gray-100 text-gray-800'}`}
                    >
                      {related.category}
                    </span>
                    <h4 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors mb-2">
                      {related.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{related.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
