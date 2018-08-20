import React, { Component } from 'react'
import ReactTable from 'react-table'
import { Card, CardBody, CardHeader, Col, Row, Form, FormGroup, Label, Input, Button } from 'reactstrap'
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
      page: 0,
      defaultPageSize: 10,
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
        page: 0,
        defaultPageSize: 10,
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

    let { defaultPageSize, page } = state
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
        Cell: row => (row.value ? row.value : 'No Data!'),
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
      },
      {
        Header: 'Last Sign In',
        accessor: 'updated',
        maxWidth: 220,
        Cell: row =>
          moment(row.value)
            .locale('id')
            .format('lll'),
      },
      {
        Header: 'Status',
        accessor: 'enable',
        id: 'enable',
        maxWidth: 70,
        Cell: row => (row.value === 1 ? 'Active' : 'Blocked'),
        filterMethod: (filter, row) => {
          if (filter.value === 'all') {
            return true
          }

          if (filter.value === '1') {
            return row[filter.id] === 1
          }

          return row[filter.id] === 0
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

    if (this.props.match.params.type === 'photographer')
      columns.splice(2, 0, {
        Header: 'Currency',
        accessor: 'currency',
        maxWidth: 70,
      })

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
                  sortable={true}
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
