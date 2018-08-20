import React, { Component } from 'react'
import ReactTable from 'react-table'
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
import { Link } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'
import 'moment/locale/id'
import 'react-table/react-table.css'

class Reservations extends Component {
  constructor() {
    super()
    this.state = {
      defaultPageSize: 10,
      filtered: [],
      page: 0,
      reservations: {
        data: [],
        loaded: false,
        loading: false,
        totalData: 0,
        totalPages: 1,
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

  render() {
    const columns = [
      {
        Header: 'ID Reservation',
        accessor: 'id',
      },
      {
        Header: 'Album Delivered',
        accessor: 'albumDelivered',
        Cell: row => (row.value === 'Y' ? 'Yes' : 'No'),
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
      },
      {
        Header: 'Updated',
        accessor: 'updated',
        maxWidth: 220,
        Cell: row =>
          moment(row.value)
            .locale('id')
            .format('lll'),
      },
      {
        Header: 'Destination',
        accessor: 'destination',
      },
      {
        Header: 'Price',
        accessor: 'totalPriceIDR',
        Cell: row => 'Rp. ' + Number(row.value).toLocaleString('id'),
      },
      {
        Header: 'Status',
        accessor: 'status',
        id: 'status',
        maxWidth: 70,
        filterMethod: (filter, row) => {
          if (filter.value === 'all') {
            return true
          }

          if (filter.value === 'PAID') return row[filter.id] === 'PAID'
          else if (filter.value === 'UNPAID') return row[filter.id] === 'UNPAID'
          else if (filter.value === 'COMPLETED') return row[filter.id] === 'COMPLETED'
        },
        Filter: ({ filter, onChange }) => (
          <select
            onChange={event => onChange(event.target.value)}
            style={{ width: '100%' }}
            value={filter ? filter.value : 'all'}>
            <option value="all">Show All</option>
            <option value="COMPLETED">Completed</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
          </select>
        ),
      },
      {
        Header: 'Actions',
        accessor: 'id',
        maxWidth: 70,
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
                  sortable={true}
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
