import React, { Component } from 'react';
import db from '../../services/database';
import ReactTable from 'react-table';
import { Card, CardBody, CardHeader, Col, Row, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/id';
import 'react-table/react-table.css';
import { filterCaseInsensitive } from '../../utils/reactTable';
import VOUCHERS from '../../constants/vouchers';
import swal from 'sweetalert2';

class Vouchers extends Component {
  constructor() {
    super()
    this.state = {
      filtered: [],
      vouchers: {
        data: [],
        loaded: false,
        loading: false,
      },
    }
  }

  componentWillMount() {
    this.fetchData()
  }

  fetchData = () => {
    this.setState(prevState => ({
      vouchers: { ...prevState.vouchers, loading: true },
    }));

    const vouchersRef = db.database().ref(VOUCHERS.NODE_VOUCHER);

    vouchersRef.once('value').then(snap => {
      let data = [];
      let vouchers = snap.val();
      
      if (vouchers) {
        Object.keys(vouchers).forEach(async key => {
          let item = {
            id: key,
            ...vouchers[key]
            
          }
          data.push(item);
        });
      }

      this.setState(prevState => {
        return {
          vouchers: {
            ...prevState.vouchers,
            loading: false,
            loaded: true,
            data: data,
          },
        }
      })
    });
  }

  handleDelete = (id) => () => {
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
          return db.database()
          .ref(VOUCHERS.NODE_VOUCHER)
          .child(id).remove()
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
      if (!result.value) {
        swal('Error', '', 'error');
      } else {
        swal(
          'Deleted!',
          'Coupon Voucher deleted!',
          'success'
        );
        const newData = this.state.vouchers.data.filter(voucher => {
          return (voucher.id !== id)
        });
        this.setState(prevState => {
          return {
            vouchers: {
              ...prevState.vouchers,
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
        Header: 'Code Voucher',
        accessor: 'code',
      },
      {
        Header: 'Amount Type',
        accessor: 'type',
        Cell: row => row.value === VOUCHERS.TYPE_FIXED ? 'Fixed' : 'Percent',
        filterMethod: (filter, row) => {
          if (filter.value === 'all') {
            return true
          }

          if (filter.value === VOUCHERS.TYPE_FIXED) {
            return row[filter.id] === VOUCHERS.TYPE_FIXED
          }

          return row[filter.id] === VOUCHERS.TYPE_PERCENT
        },
        Filter: ({ filter, onChange }) => (
          <select
            onChange={event => onChange(event.target.value)}
            style={{ width: '100%', height: '100%' }}
            value={filter ? filter.value : 'all'}>
            <option value="all">All</option>
            <option value={VOUCHERS.TYPE_FIXED}>Fixed</option>
            <option value={VOUCHERS.TYPE_PERCENT}>Percent</option>
          </select>
        ),
      },
      {
        Header: 'Amount IDR',
        accessor: 'amountIDR',
        Cell: row => {
          return Number(row.value).toLocaleString('id') + (row.original.type === VOUCHERS.TYPE_PERCENT ? ' %' : '')
        }
      },
      {
        Header: 'Amount USD',
        accessor: 'amountUSD',
        Cell: row => {
          return Number(row.value).toLocaleString('us') + (row.original.type === VOUCHERS.TYPE_PERCENT ? ' %' : '')
        }
      },
      {
        Header: 'Usage/Limit',
        id: 'usageLimitVoucher',
        accessor: d => {
          return d.usageLimitVoucher ?  (d.usageLimitVoucher) : 'Unlimited'
        }
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
        Header: 'Actions',
        accessor: 'id',
        maxWidth: 70,
        sortable: false,
        filterable: false,
        Cell: row => (
          <div style={{ textAlign: 'center' }}>
            <Link to={'/vouchers/form/' + row.value}>
              <i className="fa fa-pencil" />
            </Link>
            <span style={{marginLeft: 8, cursor: 'pointer'}} onClick={this.handleDelete(row.value)}>
                <i className="fa fa-trash" />
              </span>
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
                  <strong>Coupon Voucher List</strong>
                </h3>
              </CardHeader>
              <CardBody>
                <Row className="mb-2 justify-content-end">
                    <Col md="2">
                      <Button tag={Link} to="/vouchers/form/add" block color="primary">
                        Add New
                      </Button>
                    </Col>
                  </Row>
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
                  data={this.state.vouchers.data}
                  loading={this.state.vouchers.loading}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Vouchers
