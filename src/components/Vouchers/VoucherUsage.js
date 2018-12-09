import React, { Component } from 'react';
import db from '../../services/database';
import ReactTable from 'react-table';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/id';
import 'react-table/react-table.css';
import { filterCaseInsensitive } from '../../utils/reactTable';
import VOUCHERS from '../../constants/vouchers';

class VouchersUsage extends Component {
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
    
  }

  render() {
    const columns = [
      {
        Header: 'Usage ID',
        accessor: 'code',
      },
      {
        Header: 'Traveller',
        accessor: 'type'
      },
      {
        Header: 'Photographer',
        accessor: 'amount_IDR',
      },
      {
        Header: 'Coupon Name',
        accessor: 'amount_USD',
      },
      {
        Header: 'Amount',
        accessor: 'amount_USD',
      },
      {
        Header: 'Date Applied',
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
        Header: 'Booking Date',
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
    ]

    return (
      <div className="animated fadeIn">
        <Row>
          <Col className="mt-2">
            <Card>
              <CardHeader>
                <h3>
                  <strong>Voucher Usage</strong>
                </h3>
              </CardHeader>
              <CardBody>
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

export default VouchersUsage
