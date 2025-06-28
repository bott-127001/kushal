import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

function AdminLayout () {
  return (
    <div className='min-h-screen flex bg-[#faf9fb]'>
      {/* Sidebar */}
      <aside className='w-64 bg-[#23233a] text-white flex flex-col py-8 px-4 min-h-screen'>
        <div className='text-2xl font-serif font-bold mb-10 text-[#FFD700]'>Admin Panel</div>
        <nav className='flex flex-col gap-4'>
          <NavLink to='/admin' end className={({ isActive }) => isActive ? 'font-bold text-[#FFD700]' : 'hover:text-[#FFD700]'}>Dashboard</NavLink>
          <NavLink to='/admin/products' className={({ isActive }) => isActive ? 'font-bold text-[#FFD700]' : 'hover:text-[#FFD700]'}>Products</NavLink>
          <NavLink to='/admin/blogs' className={({ isActive }) => isActive ? 'font-bold text-[#FFD700]' : 'hover:text-[#FFD700]'}>Blogs</NavLink>
          <NavLink to='/admin/orders' className={({ isActive }) => isActive ? 'font-bold text-[#FFD700]' : 'hover:text-[#FFD700]'}>Orders</NavLink>
          <NavLink to='/admin/users' className={({ isActive }) => isActive ? 'font-bold text-[#FFD700]' : 'hover:text-[#FFD700]'}>Users</NavLink>
          <NavLink to='/admin/consultations' className={({ isActive }) => isActive ? 'font-bold text-[#FFD700]' : 'hover:text-[#FFD700]'}>Consultations</NavLink>
        </nav>
      </aside>
      {/* Main Content */}
      <main className='flex-1 p-10'>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout 