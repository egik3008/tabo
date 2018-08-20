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

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/users/:type/add', name: 'Add User', component: UserDetail },
  { path: '/users/:type/:id', name: 'User Detail', component: UserDetail },
  { path: '/users/:type', name: 'User', component: User },
  { path: '/reservations/:id', name: 'Reservation Detail', component: ReservationDetail },
  { path: '/reservations', name: 'Reservation', component: Reservation },
]

export default routes
