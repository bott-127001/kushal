import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import useAuth from './store/auth'
import useCart from './store/cart'
import HomePage from './components/homepage/HomePage'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import ProductCatalogue from './components/productcatalogue/ProductCatalogue'
import CartPage from './components/productcatalogue/CartPage'
import ProductDetails from './components/productcatalogue/ProductDetails'
import OrderConfirmation from './components/productcatalogue/OrderConfirmation'
import PaymentStatus from './components/productcatalogue/PaymentStatus'
import ConsultationPage from './components/consultation/ConsultationPage'
import BlogsCatalogue from './components/blogs/BlogsCatalogue'
import BlogPage from './components/blogs/BlogPage'
import AdminLogin from './components/admin/AdminLogin'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminProducts from './components/admin/AdminProducts'
import AdminUsers from './components/admin/AdminUsers'
import AdminBlogs from './components/admin/AdminBlogs'
import AdminOrders from './components/admin/AdminOrders'
import AdminConsultations from './components/admin/AdminConsultations'
import ProfilePage from './components/profile/ProfilePage'
import Navbar from './components/homepage/Navbar'
import CheckoutPage from './components/productcatalogue/CheckoutPage'
import AdminLayout from './components/admin/AdminLayout'
import VideoRoomPage from './components/consultation/VideoRoomPage'
import ShippingInformation from './components/homepage/ShippingInformation'
import ReturnsExchanges from './components/homepage/ReturnsExchanges'

function PageTransition ({ children }) {
  const [show, setShow] = React.useState(false)
  React.useEffect(() => {
    setShow(true)
  }, [])
  return (
    <div className={`min-h-screen flex flex-col transition-all duration-500 ${show ? 'animate-pageFadeIn' : ''}`}>
      {children}
      <style>{`
        @keyframes pageFadeIn {
          0% { opacity: 0; transform: translateY(32px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-pageFadeIn {
          animation: pageFadeIn 0.6s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </div>
  )
}

function App () {
  const { isAuthenticated } = useAuth()
  const fetchCart = useCart(state => state.fetchCart)

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated, fetchCart])

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<PageTransition><HomePage /></PageTransition>} />
        <Route path='/login' element={<PageTransition><Login /></PageTransition>} />
        <Route path='/signup' element={<PageTransition><Signup /></PageTransition>} />
        <Route path='/forgot-password' element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path='/reset-password' element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path='/products' element={<PageTransition><ProductCatalogue /></PageTransition>} />
        <Route path='/cart' element={<PageTransition><CartPage /></PageTransition>} />
        <Route path='/products/:id' element={<PageTransition><ProductDetails /></PageTransition>} />
        <Route path='/order-confirmation' element={<PageTransition><OrderConfirmation /></PageTransition>} />
        <Route path='/consultation' element={<PageTransition><ConsultationPage /></PageTransition>} />
        <Route path='/blogs' element={<PageTransition><BlogsCatalogue /></PageTransition>} />
        <Route path='/blogs/:id' element={<PageTransition><BlogPage /></PageTransition>} />
        <Route path='/admin/login' element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route path='/admin' element={<PageTransition><AdminLayout /></PageTransition>}>
          <Route index element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path='products' element={<PageTransition><AdminProducts /></PageTransition>} />
          <Route path='users' element={<PageTransition><AdminUsers /></PageTransition>} />
          <Route path='blogs' element={<PageTransition><AdminBlogs /></PageTransition>} />
          <Route path='orders' element={<PageTransition><AdminOrders /></PageTransition>} />
          <Route path='consultations' element={<PageTransition><AdminConsultations /></PageTransition>} />
        </Route>
        <Route path='/profile' element={<PageTransition><ProfilePage /></PageTransition>} />
        <Route path='/checkout' element={<PageTransition><CheckoutPage /></PageTransition>} />
        <Route path='/payment-status' element={<PageTransition><PaymentStatus /></PageTransition>} />
        <Route path='/shipping-info' element={<PageTransition><ShippingInformation /></PageTransition>} />
        <Route path='/returns-exchanges' element={<PageTransition><ReturnsExchanges /></PageTransition>} />
        <Route path='/video-room/:consultationId' element={<VideoRoomPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App 
