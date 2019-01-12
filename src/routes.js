import React from 'react'
import Loadable from 'react-loadable';


function Loading() {
  return <div>Loading...</div>
}

const Dashboard = Loadable({
  loader: () => import('./components/Dashboard'),
  loading: Loading,
})

const User = Loadable({
  loader: () => import('./components/Users'),
  loading: Loading,
})

const UserDetail = Loadable({
  loader: () => import('./components/UserDetail'),
  loading: Loading,
})

const Reservation = Loadable({
  loader: () => import('./components/Reservations'),
  loading: Loading,
})

const ReservationDetail = Loadable({
  loader: () => import('./components/ReservationDetail'),
  loading: Loading,
})

const Cashout = Loadable({
  loader: () => import('./components/Finance/Cashout'),
  loading: Loading,
})

const CashoutDetail = Loadable({
  loader: () => import('./components/Finance/CashoutDetail'),
  loading: Loading,
})

const PhotoAlbum = Loadable({
  loader: () => import('./components/PhotoAlbums'),
  loading: Loading,
})

const PhotoAlbumDetail = Loadable({
  loader: () => import('./components/PhotoAlbums/Detail'),
  loading: Loading,
})

const CurrencyRates = Loadable({
  loader: () => import('./components/Finance/CurrencyRates'),
  loading: Loading,
})

const VouchersMain = Loadable({
  loader: () => import('./components/Vouchers/index'),
  loading: Loading,
})

const VouchersForm = Loadable({
  loader: () => import('./components/Vouchers/VoucherForm'),
  loading: Loading,
})

const VouchersUsage = Loadable({
  loader: () => import('./components/Vouchers/VoucherUsage'),
  loading: Loading,
})

const Testing = Loadable({
  loader: () => import('./components/Testing'),
  loading: Loading,
})

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/testing', name: 'Testing', component: Testing },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/users/:type', exact: true, name: 'User', component: User },
  { path: '/users/:type/add', name: 'Add User', component: UserDetail },
  { path: '/users/:type/:id', name: 'User Detail', component: UserDetail },
  { path: '/reservations', exact: true, name: 'Reservation', component: Reservation },
  { path: '/reservations/:id', name: 'Reservation Detail', component: ReservationDetail },
  { path: '/photo-album', exact: true, name: 'Photo Album', component: PhotoAlbum },
  { path: '/photo-album/:id', name: 'Photo Album Detail', component: PhotoAlbumDetail },
  { path: '/finance/cashout', exact: true, name: 'Cashout', component: Cashout },
  { path: '/finance/cashout/:id', name: 'Cashout Detail', component: CashoutDetail },
  { path: '/finance/currency-rates', name: 'Currency Rates', component: CurrencyRates },
  { path: '/vouchers/form/:id', name: 'Vouchers Manage', component: VouchersForm },
  { path: '/vouchers/usage', name: 'Vouchers Usage', component: VouchersUsage },
  { path: '/vouchers', name: 'Vouchers', component: VouchersMain },
]

export default routes
