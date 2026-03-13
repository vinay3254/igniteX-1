import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import OrderConfirmPage from './pages/OrderConfirmPage'
import WishlistPage from './pages/WishlistPage'
import ProfilePage from './pages/ProfilePage'
import AboutPage from './pages/AboutPage'
import SupportPage from './pages/SupportPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <>
      <Navbar />
      <div id="page-view" style={{ minHeight: 'calc(100vh - 64px)', paddingTop: 64 }}>
        <Routes>
          <Route path="/" element={<><main id="app-root"><HomePage /></main><Footer /></>} />
          <Route path="/shop" element={<><ShopPage /><Footer /></>} />
          <Route path="/product/:id" element={<><ProductPage /><Footer /></>} />
          <Route path="/cart" element={<><CartPage /><Footer /></>} />
          <Route path="/checkout" element={<><CheckoutPage /><Footer /></>} />
          <Route path="/orders" element={<><OrdersPage /><Footer /></>} />
          <Route path="/order-confirm/:id" element={<><OrderConfirmPage /><Footer /></>} />
          <Route path="/wishlist" element={<><WishlistPage /><Footer /></>} />
          <Route path="/profile" element={<><ProfilePage /><Footer /></>} />
          <Route path="/about" element={<><AboutPage /><Footer /></>} />
          <Route path="/support" element={<><SupportPage /><Footer /></>} />
          <Route path="*" element={<><NotFoundPage /><Footer /></>} />
        </Routes>
      </div>
    </>
  )
}
