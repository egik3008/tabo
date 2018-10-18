import React, { Component } from 'react'
import ReactTable from 'react-table'
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
import { Link } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'
import 'moment/locale/id'
import 'react-table/react-table.css';

import STATUS from '../constants/reservations';

class Reservations extends Component {
  constructor() {
    super()
    this.state = {
      filtered: [],
      reservations: {
        data: [],
        loaded: false,
        loading: false,
      },
    }
  }

  componentWillMount() {
    this.fetchData(this.state)
  }

  fetchData = state => {
    this.setState(prevState => ({
      reservations: { ...prevState.reservations, loading: true },
    }))

    axios.get(`${process.env.REACT_APP_API_HOSTNAME}/api/reservations`).then(response => {
      this.setState(prevState => {
        return {
          reservations: {
            ...prevState.reservations,
            loading: false,
            loaded: true,
            data: response.data,
          },
        }
      })
    })
  }

  filterCaseInsensitive = (filter, row) => {
    const id = filter.pivotId || filter.id
    if (row[id] !== null) {
      return row[id] !== undefined ? String(row[id].toLowerCase()).includes(filter.value.toLowerCase()) : true
    }
  }

  render() {
    const columns = [
      {
        Header: 'ID Reservation',
        accessor: 'id',
      },
      {
        Header: 'Album Delivered',
        id: 'albumDelivered',
        accessor: d => {
          if (d.albumDelivered === 'Y') {
            if (d.updated) {
              return moment(d.updated).locale('id').format("DD/MM/YYYY")
            }
            return "-"
          }
          return "-";
        },
      },
      {
        Header: 'Traveler',
        accessor: 'traveler',
      },
      {
        Header: 'Photographer',
        accessor: 'photographer',
      },
      {
        Header: 'Created',
        accessor: 'created',
        maxWidth: 220,
        Cell: row =>
          moment(row.value)
            .locale('id')
            .format('lll'),
        filterMethod: (filter, row) => {
          const dateString = moment(row.created)
            .locale('id')
            .format('lll')
          return String(dateString.toLowerCase()).includes(filter.value.toLowerCase())
        },
      },
      {
        Header: 'Updated',
        accessor: 'updated',
        maxWidth: 220,
        Cell: row => {
          return row.value
            ? moment(row.value)
                .locale('id')
                .format('lll')
            : '-'
        },
        filterMethod: (filter, row) => {
          const dateString = row.updated ? moment(row.updated)
            .locale('id')
            .format('lll') : '-';
          return String(dateString.toLowerCase()).includes(filter.value.toLowerCase())
        },
      },
      {
        Header: 'Destination',
        accessor: 'destination',
      },
      {
        Header: 'Price',
        id: 'price',
        accessor: d => {
          let currency = "IDR"
          if (d.paymentCurrency) {
            currency = d.paymentCurrency;
          }
          return Number(d["totalPrice" + currency]);
        },
        Cell: cellInfo => {
          let currency = "IDR"
          if (cellInfo.original.paymentCurrency) {
            currency = cellInfo.original.paymentCurrency;
          }
          const price = Number(cellInfo.original["totalPrice" + currency]);
          return currency + " " + (currency === "IDR" ? price.toLocaleString('id') : price.toLocaleString('us'));
        },
        filterMethod: (filter, row) => {
          if (filter.value === 'all') {
            return true
          }
          if (filter.value === "IDR") 
            return row._original.paymentCurrency ? 
              (row._original.paymentCurrency === "IDR") : true
          else if (filter.value === "USD") 
            return row._original.paymentCurrency ? 
              (row._original.paymentCurrency === "USD") : false
        },
        Filter: ({ filter, onChange }) => (
          <select
            onChange={event => onChange(event.target.value)}
            style={{ width: '100%', height: "100%" }}
            value={filter ? filter.value : 'all'}>
            <option value="all">Show All</option>
            <option value="IDR">IDR</option>
            <option value="USD">USD</option>
          </select>
        ),
      },
      {
        Header: 'Status',
        accessor: 'status',
        id: 'status',
        maxWidth: 100,
        // Cell: row => {
        //   return <span
        //     style={{color: row.value === STATUS.RESERVATION_UNPAID ? 'red' 
        //       : (row.value === STATUS.RESERVATION_PENDING ? 'inherit' 
        //       : 'green')}
        //     }
        //   >
        //     {row.value}
        //   </span>
        // },
        filterMethod: (filter, row) => {
          if (filter.value === 'all') {
            return true
          }

          if (filter.value === STATUS.RESERVATION_PAID) return row[filter.id] === STATUS.RESERVATION_PAID
          else if (filter.value === STATUS.RESERVATION_UNPAID) return row[filter.id] === STATUS.RESERVATION_UNPAID
          else if (filter.value === STATUS.RESERVATION_COMPLETED) return row[filter.id] === STATUS.RESERVATION_COMPLETED
          else if (filter.value === STATUS.RESERVATION_PENDING) return row[filter.id] === STATUS.RESERVATION_PENDING
          else if (filter.value === STATUS.RESERVATION_ACCEPTED) return row[filter.id] === STATUS.RESERVATION_ACCEPTED
        },
        Filter: ({ filter, onChange }) => (
          <select
            onChange={event => onChange(event.target.value)}
            style={{ width: '100%', height: "100%" }}
            value={filter ? filter.value : 'all'}>
            <option value="all">Show All</option>
            <option value={STATUS.RESERVATION_COMPLETED}>Completed</option>
            <option value={STATUS.RESERVATION_ACCEPTED}>Accepted</option>
            <option value={STATUS.RESERVATION_PAID}>Paid</option>
            <option value={STATUS.RESERVATION_PENDING}>Pending</option>
            <option value={STATUS.RESERVATION_UNPAID}>Unpaid</option>
          </select>
        ),
      },
      {
        Header: 'Actions',
        accessor: 'id',
        maxWidth: 70,
        sortable: false,
        filterable: false,
        Cell: row => (
          <div style={{ textAlign: 'center' }}>
            <Link to={'/reservations/' + row.value}>
              <i className="fa fa-pencil" />
            </Link>
          </div>
        ),
      },
    ]

    return (
      <div className="animated fadeIn">
        <Row>
          <Col className="mt-2">
            <Card>
              <CardHeader>
                <h3>
                  <strong>Reservations List</strong>
                </h3>
              </CardHeader>
              <CardBody>
                <ReactTable
                  className="-striped -hightlight"
                  columns={columns}
                  filterable={true}
                  defaultFilterMethod={this.filterCaseInsensitive}
                  sortable={true}
                  defaultSorted={[
                    {
                      id: 'updated',
                      desc: true,
                    },
                  ]}
                  defaultPageSize={10}
                  data={this.state.reservations.data}
                  loading={this.state.reservations.loading}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Reservations
