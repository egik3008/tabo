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
      filtered: [{ search: '', enable: 'all' }],
      sort: [{ key: '', method: '' }],
      page: 0,
      defaultPageSize: 10,
      users: {
        loading: false,
        loaded: false,
        data: [],
        totalData: 0,
      },
    }
  }

  componentWillMount() {
    this.setState({
      type: this.props.match.params.type,
      filtered: [{ search: '', enable: 'all' }],
      sort: [{ key: '', method: '' }],
      page: 0,
      defaultPageSize: 10,
    })
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.type !== prevProps.match.params.type) {
      this.setState(
        {
          type: this.props.match.params.type,
          filtered: [{ search: '', enable: 'all' }],
          sort: [{ key: '', method: '' }],
          page: 0,
          defaultPageSize: 10,
        },
        () => {
          this.fetchUsersData(this.state)
        }
      )
    }
  }

  onInputChange(e) {
    this.setState({ filtered: [{ search: e.target.value }] }, () => {
      this.fetchUsersData(this.state)
    })
  }

  onSelectChange(e) {
    this.setState({ filtered: [{ enable: e.target.value }] }, () => {
      this.fetchUsersData(this.state)
    })
  }

  fetchUsersData = state => {
    this.setState(prevState => ({
      users: { ...prevState.users, loading: true },
    }))

    let { defaultPageSize, page, filtered, sort } = state
    const type = this.props.match.params.type === 'photographer' ? 'p' : 't'
    let queryParams = `userType=${type}&page=${page}&limit=${defaultPageSize}`
    queryParams += `&sort[method]=${sort.method}&sort[key]=${sort.key}`
    queryParams += filtered.some(e => e.hasOwnProperty('search'))
      ? `&filter[search]=${filtered.map(e => e.search)}`
      : ``

    if (filtered.length > 0) {
      filtered.forEach(item => {
        if ('enable' in item && item.enable !== 'all') {
          queryParams = queryParams + `&filter[enable]=${item.enable}`
        }
      })
    }

    axios
      .get(`${process.env.REACT_APP_API_HOSTNAME}/api/admin/users/?${queryParams}`)
      .then(response => {
        if (JSON.stringify(response.data.data) === JSON.stringify(this.state.users.data) && this.state.count === 1) {
          const count = this.state.count + 1
          this.setState({ count: count }, () => {
            this.fetchUsersData(this.state)
          })
        } else {
          this.setState({ count: 1 })
          // if (response.data.data.length > 0) {
          this.setState(prevState => {
            return {
              users: {
                ...prevState.users,
                loading: false,
                loaded: true,
                data: response.data.data,
                totalData: response.data.metaInfo.nbHits,
                totalPages: response.data.metaInfo.nbPages,
              },
            }
          })
          // }
        }
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

                <Row className="mb-1 justify-content-between">
                  <Col md="4">
                    <Form inline>
                      <FormGroup>
                        <Label className="mr-2">Filter by Status : </Label>
                        <Input type="select" onChange={this.onSelectChange.bind(this)}>
                          <option value="all">All</option>
                          <option value="1">Active</option>
                          <option value="0">Blocked</option>
                        </Input>
                      </FormGroup>
                    </Form>
                  </Col>

                  <Col md="6" className="justify-content-end">
                    <Form inline>
                      <FormGroup className="ml-auto">
                        <Input type="select" className="mr-2">
                          <option disabled selected>
                            Filter By
                          </option>
                          <option value="uid">ID</option>
                          <option value="displayName">Display Name</option>
                          <option value="countryName">Country</option>
                          <option value="email">Email</option>
                        </Input>
                        <Input type="text" placeholder="Enter keyword" onChange={this.onInputChange.bind(this)} />
                      </FormGroup>
                    </Form>
                  </Col>
                </Row>

                <ReactTable
                  className="-striped -hightlight"
                  columns={columns}
                  manual={true}
                  sortable={true}
                  data={this.state.users.data}
                  pages={this.state.users.totalPages}
                  loading={this.state.users.loading}
                  onFetchData={() => {
                    setTimeout(() => {
                      this.fetchUsersData(this.state)
                    }, 1)
                  }}
                  type={this.state.type}
                  filtered={this.state.filtered}
                  pageSize={this.state.defaultPageSize}
                  onPageChange={e => {
                    this.setState({ page: e })
                  }}
                  onPageSizeChange={(pageSize, page) => {
                    this.setState({ page: page, defaultPageSize: pageSize })
                  }}
                  onSortedChange={e => {
                    this.setState({
                      sort: {
                        method: e[0].desc ? 'desc' : 'asc',
                        key: e[0].id,
                      },
                    })
                  }}
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
