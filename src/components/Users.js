import React, { Component } from 'react'
import ReactTable from 'react-table'
import { Card, CardBody, CardHeader, Col, Row, Form, FormGroup, Label, Input } from 'reactstrap'
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
      type: '',
      filtered: [{ search: '', enable: 'all' }],
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
    })
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.type !== prevProps.match.params.type) {
      this.setState({
        type: this.props.match.params.type,
        filtered: [{ search: '', enable: 'all' }],
      })
      this.fetchUsersData(this.state)
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

    let { defaultPageSize, page, filtered } = state
    console.log(filtered)
    const type = this.props.match.params.type === 'photographer' ? 'p' : 't'
    let queryParams = `userType=${type}&page=${page}&limit=${defaultPageSize}`
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
        accessor: 'created',
        maxWidth: 200,
        Cell: row =>
          moment(row.value)
            .locale('id')
            .format('ll'),
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
      })

    return (
      <div className="animated fadeIn">
        <Row>
          <Col className="mt-2">
            <Card>
              <CardHeader>{this.state.type} List</CardHeader>
              <CardBody>
                <Row className="pb-2">
                  <Col>
                    <Form inline>
                      <FormGroup>
                        <Label className="pr-1">Filter by Status : </Label>
                        <Input type="select" onChange={this.onSelectChange.bind(this)}>
                          <option value="all">All</option>
                          <option value="1">Active</option>
                          <option value="0">Blocked</option>
                        </Input>
                      </FormGroup>
                    </Form>
                  </Col>

                  <Col />

                  <Col>
                    <Form>
                      <FormGroup>
                        <Input type="text" placeholder="Enter keyword" onChange={this.onInputChange.bind(this)} />
                      </FormGroup>
                    </Form>
                  </Col>
                </Row>

                <ReactTable
                  className="mt-1 -striped -hightlight"
                  columns={columns}
                  manual
                  sortable={false}
                  data={this.state.users.data}
                  pages={this.state.users.totalPages}
                  loading={this.state.users.loading}
                  onFetchData={this.fetchUsersData}
                  type={this.state.type}
                  filtered={this.state.filtered}
                  defaultPageSize={this.state.defaultPageSize}
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
