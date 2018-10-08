import React from 'react'
import Loadable from 'react-loadable'

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

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/users/:type/add', name: 'Add User', component: UserDetail },
  { path: '/users/:type/:id', name: 'User Detail', component: UserDetail },
  { path: '/users/:type', name: 'User', component: User },
  { path: '/reservations/:id', name: 'Reservation Detail', component: ReservationDetail },
  { path: '/reservations', name: 'Reservation', component: Reservation },
  { path: '/finance/cashout', exact: true, name: 'Cashout', component: Cashout },
  { path: '/finance/cashout/:id', exact: true, name: 'Cashout', component: CashoutDetail },
]

export default routes
