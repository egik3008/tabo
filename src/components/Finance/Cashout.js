import React, { Component } from 'react';
import { database } from '../../services/database';
import ReactTable from 'react-table'
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
import { Link } from 'react-router-dom'
import moment from 'moment'
import 'moment/locale/id'
import 'react-table/react-table.css';

import CASHOUT from '../../constants/cashout';

class Cashout extends Component {
  constructor() {
    super()
    this.state = {
      filtered: [],
      cashout: {
        data: [],
        loaded: false,
        loading: false,
      },
    }
  }

  componentWillMount() {
    this.fetchData(this.state);
  }

  fetchData = state => {
    this.setState(prevState => ({
      cashout: { ...prevState.cashout, loading: true },
    }));

    const db = database.database();
    db.ref('cashout').once('value', snapshot => {
      const data = snapshot.val();
      let cashoutList = [];
      Object.keys(data).forEach(key => {
        let cashout = data[key];
        cashout.id = key;
        cashoutList.push(cashout);
      })

      this.setState({
        cashout: {
          loading: false,
          loaded: true,
          data: cashoutList
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
        Header: 'CashOut ID',
        accessor: 'id',
      },
      {
        Header: 'Photographer',
        accessor: 'photographerDisplayName',
      },
      {
        Header: 'Amount',
        id: 'amount',
        accessor: d => {
          const currency = d.currency || 'IDR';
          const local = currency === 'IDR' ? 'id' : 'us';
          return `${currency} ${Number(d.amount).toLocaleString(local)}`;
        },
      },
      {
        Header: 'Method',
        accessor: 'paymentType',
        Cell: row => {
          return row.value === CASHOUT.BANK_METHOD ? 'Bank Transfer' : 'PayPal';
        },
        filterMethod: (filter, row) => {
          if (filter.value === 'all') {
            return true
          }

          if (filter.value === CASHOUT.PAYPAL_METHOD) return row[filter.id] === CASHOUT.PAYPAL_METHOD
          else if (filter.value === CASHOUT.BANK_METHOD) return row[filter.id] === CASHOUT.BANK_METHOD
        },
        Filter: ({ filter, onChange }) => (
          <select
            onChange={event => onChange(event.target.value)}
            style={{ width: '100%', height: "100%" }}
            value={filter ? filter.value : 'all'}>
            <option value="all">Show All</option>
            <option value={CASHOUT.BANK_METHOD}>Bank Transfer</option>
            <option value={CASHOUT.PAYPAL_METHOD}>PayPal</option>
          </select>
        ),
      },
      {
        Header: 'Created',
        accessor: 'created',
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
        Header: 'Status',
        accessor: 'status',
        id: 'status',
        maxWidth: 100,
        filterMethod: (filter, row) => {
          if (filter.value === 'all') {
            return true
          }

          if (filter.value === CASHOUT.STATUS_REQUESTED) return row[filter.id] === CASHOUT.STATUS_REQUESTED
          else if (filter.value === CASHOUT.STATUS_PROCESSING) return row[filter.id] === CASHOUT.STATUS_PROCESSING
          else if (filter.value === CASHOUT.STATUS_DONE) return row[filter.id] === CASHOUT.STATUS_DONE
        },
        Filter: ({ filter, onChange }) => (
          <select
            onChange={event => onChange(event.target.value)}
            style={{ width: '100%', height: "100%" }}
            value={filter ? filter.value : 'all'}>
            <option value="all">Show All</option>
            <option value={CASHOUT.STATUS_REQUESTED}>Requested</option>
            <option value={CASHOUT.STATUS_PROCESSING}>Processing</option>
            <option value={CASHOUT.STATUS_DONE}>Done</option>
          </select>
        ),
      },
      {
        Header: 'Detail',
        accessor: 'id',
        maxWidth: 70,
        sortable: false,
        filterable: false,
        Cell: row => (
          <div style={{ textAlign: 'center' }}>
            <Link to={'/finance/cashout/' + row.value}>
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
                  <strong>Cash Out</strong>
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
                      id: 'created',
                      desc: true,
                    },
                  ]}
                  defaultPageSize={10}
                  data={this.state.cashout.data}
                  loading={this.state.cashout.loading}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Cashout;
