import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../api/client'
import ProductCard from '../components/ProductCard'
import Spinner from '../components/Spinner'

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('category') || ''
  const tag = searchParams.get('tag') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || ''
  const page = parseInt(searchParams.get('page') || '1')

  const [products, setProducts] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    window.scrollTo(0, 0)
    api.get('/products/categories').then(r => setCategories(r.data.categories)).catch(() => {})
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    loadProducts()
  }, [category, tag, search, sort, page])

  async function loadProducts() {
    setLoading(true)
    try {
      const params = { limit: '12', page: String(page) }
      if (category) params.category = category
      if (tag) params.tag = tag
      if (search) params.search = search
      if (sort) params.sort = sort
      const { data } = await api.get('/products', { params })
      setProducts(data.products)
      setTotal(data.pagination.total)
      setTotalPages(data.pagination.totalPages)
    } catch {
      setProducts([])
    } finally { setLoading(false) }
  }

  function updateParams(updates) {
    const np = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null) np.delete(k)
      else np.set(k, v)
    })
    np.delete('page')
    setSearchParams(np)
  }

  const pageTitle = search
    ? `Search: "${search}"`
    : category
      ? (categories.find(c => c.slug === category)?.name || category)
      : tag
        ? tag.charAt(0).toUpperCase() + tag.slice(1) + ' Products'
        : 'All Products'

  return (
    <div className="page-container page-enter">
      <div className="breadcrumb">
        <Link to="/">Home</Link> <span>›</span>
        <Link to="/shop">Shop</Link>
        {(category || tag || search) && <><span>›</span><span>{pageTitle}</span></>}
      </div>
      <div className="shop-layout">
        <aside className="shop-sidebar">
          <div className="sidebar-section">
            <p className="sidebar-title">Categories</p>
            <div
              className={`sidebar-cat-item${!category ? ' active' : ''}`}
              onClick={() => updateParams({ category: null })}
            >All Products</div>
            {categories.map(c => (
              <div
                key={c.slug}
                className={`sidebar-cat-item${category === c.slug ? ' active' : ''}`}
                onClick={() => updateParams({ category: c.slug })}
              >{c.name}</div>
            ))}
          </div>
          <div className="sidebar-section">
            <p className="sidebar-title">Tags</p>
            <div className="sidebar-tags">
              {[{ label: 'All', value: '' }, { label: '🆕 New', value: 'new' }, { label: '🔥 Hot', value: 'hot' }, { label: '💸 Sale', value: 'sale' }].map(t => (
                <div
                  key={t.value}
                  className={`sidebar-tag-item${tag === t.value ? ' active' : ''}`}
                  onClick={() => updateParams({ tag: t.value || null })}
                >{t.label}</div>
              ))}
            </div>
          </div>
        </aside>
        <div className="shop-main">
          <div className="shop-toolbar">
            <p className="shop-result-count">
              Showing <strong>{total}</strong> products
              {pageTitle !== 'All Products' && <> in <strong>{pageTitle}</strong></>}
            </p>
            <div className="shop-sort">
              <span>Sort:</span>
              <select value={sort} onChange={e => updateParams({ sort: e.target.value || null })}>
                <option value="">Featured</option>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
          {loading ? (
            <Spinner />
          ) : products.length === 0 ? (
            <div className="shop-grid">
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-sec)' }}>
                No products found. <Link to="/shop" style={{ color: 'var(--blue)' }}>Clear filters</Link>
              </div>
            </div>
          ) : (
            <div className="shop-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          {totalPages > 1 && (
            <div className="shop-pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(i => (
                <button
                  key={i}
                  className={`page-btn${i === page ? ' active' : ''}`}
                  onClick={() => {
                    const np = new URLSearchParams(searchParams)
                    np.set('page', String(i))
                    setSearchParams(np)
                  }}
                >{i}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
