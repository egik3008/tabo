import React, { Component } from 'react'
import ReactTable from 'react-table'
import { Card, CardBody, CardHeader, Col, Row, Button } from 'reactstrap'
import { Link } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'
import 'moment/locale/id'
// import map from 'lodash/map'
import 'react-table/react-table.css'
// import { database } from "../services/database"

class Users extends Component {
  constructor() {
    super()
    this.state = {
      count: 1,
      type: '',
      filtered: [],
      sort: [{ key: '', method: '' }],
      users: {
        loading: false,
        loaded: false,
        data: [],
      },
    }
  }

  componentWillMount() {
    this.setState(
      {
        type: this.props.match.params.type,
        filtered: [],
        sort: [{ key: '', method: '' }],
      },
      () => {
        this.fetchUsersData(this.state)
      }
    )
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.type !== prevProps.match.params.type) {
      this.setState(
        {
          type: this.props.match.params.type,
          filtered: [],
          sort: [{ key: '', method: '' }],
          page: 0,
          defaultPageSize: 10,
        },
        () => {
          console.log(this.state.filtered)
          this.fetchUsersData(this.state)
        }
      )
    }
  }

  fetchUsersData = state => {
    this.setState(prevState => ({
      users: { ...prevState.users, loading: true },
    }))

    const type = this.props.match.params.type === 'photographer' ? 'p' : 't'

    axios
      .get(`${process.env.REACT_APP_API_HOSTNAME}/api/users/?type=${type}`)
      .then(response => {
        // if (response.data.data.length > 0) {
        this.setState(prevState => {
          return {
            users: {
              ...prevState.users,
              loading: false,
              loaded: true,
              data: response.data,
            },
          }
        })
        // }
      })
      .catch(error => {
        console.error(error)
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
        Header: 'ID Traveler',
        accessor: 'uid',
      },
      {
        Header: 'Name',
        accessor: 'displayName',
      },
      {
        Header: 'Country',
        accessor: 'countryName',
        maxWidth: 80,
        Cell: row => (row.value ? row.value : '-'),
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Signed Up',
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
        Header: 'Last Updated',
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
          const dateString = moment(row.updated)
            .locale('id')
            .format('lll')
          return String(dateString.toLowerCase()).includes(filter.value.toLowerCase())
        },
      },
      {
        Header: 'Status',
        accessor: 'enable',
        id: 'enable',
        maxWidth: 110,
        Cell: row => (Number(row.value) === 1 ? 'Active' : 'Blocked'),
        filterMethod: (filter, row) => {
          if (filter.value === 'all') {
            return true
          }

          if (filter.value === '1') {
            return Number(row[filter.id]) === 1
          }

          return Number(row[filter.id]) === 0
        },
        Filter: ({ filter, onChange }) => (
          <select
            onChange={event => onChange(event.target.value)}
            style={{ width: '100%' }}
            value={filter ? filter.value : 'all'}>
            <option value="all">Show All</option>
            <option value="1">Active</option>
            <option value="0">Blocked</option>
          </select>
        ),
      },
      {
        Header: 'Actions',
        accessor: 'uid',
        maxWidth: 70,
        Cell: row => (
          <div style={{ textAlign: 'center' }}>
            <Link to={'/users/' + this.props.match.params.type + '/' + row.value}>
              <i className="fa fa-pencil" />
            </Link>
          </div>
        ),
      },
    ]

    if (this.props.match.params.type === 'photographer') {
      columns.splice(2, 0, {
        Header: 'Currency',
        accessor: 'currency',
        maxWidth: 70,
      })

      columns.splice(6, 0, {
        Header: 'Completion',
        maxWidth: 90,
        Cell: cellInfo => {
          let completion = 100

          if ('photographerInfo' in cellInfo.original) {
            if (!('cameraEquipment' in cellInfo.original.photographerInfo)) completion -= 10
            if (!('languages' in cellInfo.original.photographerInfo)) completion -= 10
            if (!('location' in cellInfo.original.photographerInfo)) completion -= 10
            if (!('meetingPoints' in cellInfo.original.photographerInfo)) completion -= 10
            if (!('packagesPrice' in cellInfo.original.photographerInfo)) completion -= 10
            if (!('photosPortofolio' in cellInfo.original.photographerInfo)) completion -= 10
            if (!('selfDescription' in cellInfo.original.photographerInfo)) completion -= 10
          } else {
            completion = 0
          }

          return <span>{completion} %</span>
        },
      })
    }

    return (
      <div className="animated fadeIn">
        <Row>
          <Col className="mt-2">
            <Card>
              <CardHeader>
                <h3>
                  <strong>{this.state.type} List</strong>
                </h3>
              </CardHeader>
              <CardBody>
                {this.props.match.params.type === 'photographer' && (
                  <Row className="mb-2 justify-content-end">
                    <Col md="3">
                      <Button tag={Link} to="/users/photographer/add" block color="primary">
                        Add Photographer
                      </Button>
                    </Col>
                  </Row>
                )}

                <ReactTable
                  className="-striped -hightlight"
                  columns={columns}
                  filterable={true}
                  defaultFilterMethod={this.filterCaseInsensitive}
                  sortable={true}
                  defaultSorted={[
                    {
                      id: 'created',
                      desc: true,
                    },
                  ]}
                  defaultPageSize={10}
                  filtered={this.state.filtered}
                  onFilteredChange={filtered => {
                    this.setState({ filtered })
                  }}
                  data={this.state.users.data}
                  loading={this.state.users.loading}
                  type={this.state.type}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Users
