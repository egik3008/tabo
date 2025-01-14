import React, { Component } from 'react';
import ReactTable from 'react-table';
import { withRouter } from 'react-router-dom';
import { Card, CardBody, CardHeader, Col, Row, Button } from 'reactstrap';
import { Link } from 'react-router-dom'
import axios from 'axios';
import moment from 'moment'
import 'moment/locale/id'
import 'react-table/react-table.css';
import swal from 'sweetalert2';
import { filterCaseInsensitive } from '../utils/reactTable';

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

  isPhotographers = () => {
    return (this.props.match.params.type === 'photographer');
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
          this.fetchUsersData(this.state)
        }
      )
    }
  }

  fetchUsersData = state => {
    this.setState(prevState => ({
      users: { ...prevState.users, loading: true },
    }))

    const type = this.isPhotographers() ? 'p' : 't'

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

  setupData = (data) => {
    return data.map(d => {
      let completion = 100
      if ('photographerInfo' in d) {
        if (!('cameraEquipment' in d.photographerInfo)) completion -= 10
        if (!('languages' in d.photographerInfo)) completion -= 10
        if (!('location' in d.photographerInfo)) completion -= 10
        if (!('meetingPoints' in d.photographerInfo)) completion -= 10
        if (!('packagesPrice' in d.photographerInfo)) completion -= 10
        if (!('photosPortofolio' in d.photographerInfo)) completion -= 10
        if (!('selfDescription' in d.photographerInfo)) completion -= 10
      } else {
        completion = 0
      }
      d.completion = completion;
      d.countryName = d.countryName ? d.countryName : '-';
      if (this.isPhotographers()) d.currency = d.currency ? d.currency : '-';

      return d;
    })
  }

  handleDelete = (uid, email) => () => {
    swal({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      showLoaderOnConfirm: true,
      preConfirm: (confirm) => {
        if (confirm) {
          return axios
          .delete(`${process.env.REACT_APP_API_HOSTNAME}/api/users/traveller/${uid}`)
          .then(response => {
            return response;
          })
          .catch(error => {
            console.log(error);
          })
        }
        
      },
      allowOutsideClick: () => !swal.isLoading()
    }).then((result) => {
      const response = result.value.data;
      if (!response.status) {
        swal('Error', response.message, 'error');
      } else {
        swal(
          'Deleted!',
          response.message,
          'success'
        );
        const newData = this.state.users.data.filter(user => {
          return (user.uid !== uid)
        });
        this.setState(prevState => {
          return {
            users: {
              ...prevState.users,
              loading: false,
              loaded: true,
              data: newData,
            },
          }
        })
      }
    })
  }

  render() {
    const columns = [
      {
        Header: 'Name',
        accessor: 'displayName',
      },
      {
        Header: 'Country',
        accessor: 'countryName',
        maxWidth: 80,
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
          const dateString = row.created ? moment(row.created)
            .locale('id')
            .format('lll') : "-";
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
          const dateString = row.updated ? moment(row.updated)
            .locale('id')
            .format('lll'): '-';
          return String(dateString.toLowerCase()).includes(filter.value.toLowerCase())
        },
      },
      {
        Header: 'Status',
        accessor: 'enable',
        id: 'enable',
        maxWidth: 90,
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
            style={{ width: '100%', height: '100%' }}
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
        sortable: false,
        filterable: false,
        Cell: row => (
          <div style={{ textAlign: 'center' }}>
            <Link to={'/users/' + this.props.match.params.type + '/' + row.value}>
              <i className="fa fa-pencil" />
            </Link>
            { !this.isPhotographers() && (
              <span style={{marginLeft: 8, cursor: 'pointer'}} onClick={this.handleDelete(row.value, row.original.email)}>
                <i className="fa fa-trash" />
              </span>
            )}
          </div>
        ),
      },
    ]

    if (!this.isPhotographers()) {

      columns.splice(0, 0, {
        Header: 'ID Traveller',
        accessor: 'uid',
      })
      // {
      // },
    }

    if (this.isPhotographers()) {
      columns.splice(2, 0, {
        Header: 'Currency',
        accessor: 'currency',
        maxWidth: 70,
      })

      columns.splice(4, 0, {
        Header: 'City',
        accessor: 'locationAdmLevel2',
        maxWidth: 130,
        filterMethod: (filter, row) => {
          const str = row.locationAdmLevel2 ? row.locationAdmLevel2 : "-";
          return String(str.toLowerCase()).includes(filter.value.toLowerCase())
        },
      })

      columns.splice(6, 0, {
        Header: 'Completion',
        accessor: 'completion',
        maxWidth: 90,
        Cell: row => (<span>{row.value} %</span>),
      });

      columns.splice(8, 0, {
        Header: 'Show?',
        id: 'hidden',
        accessor: 'hidden',
        maxWidth: 80,
        Cell: row => row.value ? 'Hide' : 'Show',
        filterMethod: (filter, row) => {
          if (filter.value === 'all') {
            return true
          }

          if (filter.value === '1') {
            return !!row[filter.id] === false
          }

          return !!row[filter.id] === true
        },
        Filter: ({ filter, onChange }) => (
          <select
            onChange={event => onChange(event.target.value)}
            style={{ width: '100%', height: '100%' }}
            value={filter ? filter.value : 'all'}>
            <option value="all">All</option>
            <option value="1">Show</option>
            <option value="0">Hide</option>
          </select>
        ),
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
                  defaultFilterMethod={filterCaseInsensitive}
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
                  data={this.setupData(this.state.users.data)}
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

export default withRouter(Users);
