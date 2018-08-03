import React, { Component } from 'react'
import ReactTable from 'react-table'
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
import axios from 'axios'
// import map from 'lodash/map'
import 'react-table/react-table.css'
// import { database } from "../services/database"

class Users extends Component {
  constructor() {
    super()
    this.state = {
      type: '',
      filtered: [],
      page: 0,
      defaultPageSize: 5,
      users: {
        loading: false,
        loaded: false,
        data: [],
        totalData: 0
      }
    }
  }

  componentWillMount() {
    this.setState({ type: this.props.match.params.type })
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.type !== prevProps.match.params.type) {
      this.setState({ type: this.props.match.params.type })
      this.fetchUsersData(this.state)
    }
  }

  fetchUsersData = state => {
    this.setState(prevState => ({
      users: { ...prevState.users, loading: true }
    }))

    const { defaultPageSize, page, filtered } = state
    let queryParams = `userType=${this.props.match.params.type}&page=${page}&limit=${defaultPageSize}`

    if (filtered.length > 0) {
      filtered.forEach(item => {
        queryParams = queryParams + `&filter[${item.id}]=${item.value}`
      })
    }

    axios
      .get(`${process.env.REACT_APP_API_HOSTNAME}/api/admin/users/?${queryParams}`)
      .then(response => {
        if (response.data.data.length > 0) {
          this.setState(prevState => {
            return {
              users: {
                ...prevState.users,
                loading: false,
                loaded: true,
                data: response.data.data,
                totalData: response.data.metaInfo.nbHits,
                totalPages: response.data.metaInfo.nbPages
              }
            }
          })
        }
      })
      .catch((error) => {
        console.error(error)
      })
  }

  render() {
    const columns = [
      {
        Header: 'Name',
        accessor: 'displayName'
      },
      {
        Header: 'Type',
        accessor: 'userType'
      },
      {
        Header: 'Registered',
        accessor: 'created'
      },
      {
        Header: 'Status',
        accessor: 'enable',
        Cell: row => row.value === 1 ? 'Active' :'Suspend'
      },
      {
        Header: 'Email',
        accessor: 'email'
      },
      {
        Header: 'Phone country code',
        accessor: 'phoneDialCode'
      },
      {
        Header: 'Phone number',
        accessor: 'phoneNumber'
      },
      {
        Header: 'Country',
        accessor: 'countryName'
      },
      {
        Header: 'Actions',
        accessor: 'uid',
        Cell: row => (
          <div style={{ textAlign: 'center' }}>
            <a className="btn btn-info btn-sm" href={`/sesuatu/${row.value}`}>Manage</a>
          </div>
        )
      }
    ]

    return (
      <div className="animated fadeIn">
        <Row>
          <Col>
            <Card>
              <CardHeader>
                Traveler List
              </CardHeader>
              <CardBody>
                <ReactTable
                  columns={columns}
                  manual
                  data={this.state.users.data}
                  pages={this.state.users.totalPages}
                  loading={this.state.users.loading}
                  onFetchData={this.fetchUsersData}
                  type={this.state.type}
                  filterable
                  defaultPageSize={this.state.defaultPageSize}
                  className="-striped -highlight"
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
