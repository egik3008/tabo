import React, { Component } from 'react'
import ReactTable from 'react-table'
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
import { Link } from 'react-router-dom'
import axios from 'axios'
import moment from'moment'
import 'moment/locale/id'
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
        Header: 'Country',
        accessor: 'countryName'
      },
      {
        Header: 'Email',
        accessor: 'email'
      },
      {
        Header: 'Signed Up',
        accessor: 'created',
        Cell: row => moment(row.value).locale('id').format('ll')
      },
      {
        Header: 'Status',
        accessor: 'enable',
        Cell: row => row.value === 1 ? 'Active' : 'Blocked'
      },
      {
        Header: 'Actions',
        accessor: 'uid',
        Cell: row => (
          <div style={{ textAlign: 'center' }}>
            <Link to={"/user/"+this.props.match.params.type+"/"+row.value}><i className="fa fa-pencil"></i></Link>
          </div>
        )
      }
    ]

    if (this.props.match.params.type === 'p')
      columns.splice(2, 0, {
        Header: 'Currency',
        accessor: 'currency'
      })

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
