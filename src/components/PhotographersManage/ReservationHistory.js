import React from 'react';
import {
  Row,
  Col,
  Button
} from 'reactstrap';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import moment from 'moment';
import { CSVLink } from "react-csv";

import STATUS from '../../constants/reservations';
import {filterCaseInsensitive} from '../../utils/reactTable';

class ReservationHistory extends React.Component  {

  getCSVData = () => {
    const { photographer } = this.props;
    if (photographer.reservationHistory) {
      return photographer.reservationHistory.map(rsrv => ({
        "Traveller ID": rsrv.travellerId,
        "Traveler Name": rsrv.uidMapping[rsrv.travellerId].displayName,
        "Destination": rsrv.destination,
        "Email": rsrv.uidMapping[rsrv.travellerId].email,
        "Currency": rsrv.paymentCurrency ? rsrv.paymentCurrency : "IDR",
        "Updated": moment(rsrv.created).locale('id').format('lll'),
        "Status": rsrv.status
      }));
    } else return [];
  }

  render() {
      const { photographer } = this.props;
      return (
          <React.Fragment>
            <Row className="mb-2 justify-content-end">
              <Col md="2">
              <CSVLink 
                data={this.getCSVData()}
                filename={"reservation-history.csv"}
                target="_blank"
              >
                <Button block color="primary">
                  Export
                </Button>
                </CSVLink>
              </Col>
            </Row>
            <ReactTable
              className="-striped -hightlight"
              columns={this.historyColumns()}
              sortable={true}
              filterable={true}
              defaultFilterMethod={filterCaseInsensitive}
              defaultSorted={[
                {
                  id: 'created',
                  desc: true,
                },
              ]}
              defaultPageSize={10}
              data={photographer.reservationHistory}
            //   loading={this.state.loading}
            />
          </React.Fragment>
      )
    }

    historyColumns = () => {
      return [
        {
          Header: 'Traveler ID',
          accessor: 'travellerId',
        },
        {
          Header: 'Traveler Name',
          id: 'travelName',
          accessor: d => {
            return d.uidMapping[d.travellerId].displayName;
          },
        },
        {
          Header: 'Destination',
          accessor: 'destination',
          maxWidth: 180,
        },
        {
          Header: 'Email',
          id: 'email',
          accessor: d => {
            return d.uidMapping[d.travellerId].email;
          },
        },
        {
          Header: 'Currency',
          maxWidth: 80,
          id: 'currency',
          accessor: d => {
            return d.paymentCurrency ? d.paymentCurrency : "IDR"
          },
          filterMethod: (filter, row) => {
            if (filter.value === 'all') {
              return true
            }
            return filter.value === (row._original.paymentCurrency || "IDR");
          },
          Filter: ({ filter, onChange }) => (
            <select
              onChange={event => onChange(event.target.value)}
              style={{ width: '100%', height: "100%" }}
              value={filter ? filter.value : 'all'}>
              <option value="all">All</option>
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
            </select>
          ),
        },
        {
          Header: 'Updated',
          accessor: 'created',
          Cell: row =>
            moment(row.value)
              .locale('id')
              .format('lll'),
          filterMethod: (filter, row) => {
            const dateString = row.created ? moment(row.created)
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
          // Cell: row => {
          //   return <span
          //     style={{color: row.value === STATUS.RESERVATION_UNPAID ? 'red' 
          //       : (row.value === STATUS.RESERVATION_PENDING ? 'inherit' 
          //       : 'green')}
          //     }
          //   >
          //     {row.value}
          //   </span>
          // },
          filterMethod: (filter, row) => {
            if (filter.value === 'all') {
              return true
            }
  
            if (filter.value === STATUS.RESERVATION_PAID) return row[filter.id] === STATUS.RESERVATION_PAID
            else if (filter.value === STATUS.RESERVATION_UNPAID) return row[filter.id] === STATUS.RESERVATION_UNPAID
            else if (filter.value === STATUS.RESERVATION_COMPLETED) return row[filter.id] === STATUS.RESERVATION_COMPLETED
            else if (filter.value === STATUS.RESERVATION_PENDING) return row[filter.id] === STATUS.RESERVATION_PENDING
            else if (filter.value === STATUS.RESERVATION_ACCEPTED) return row[filter.id] === STATUS.RESERVATION_ACCEPTED
          },
          Filter: ({ filter, onChange }) => (
            <select
              onChange={event => onChange(event.target.value)}
              style={{ width: '100%', height: "100%" }}
              value={filter ? filter.value : 'all'}>
              <option value="all">All</option>
              <option value={STATUS.RESERVATION_COMPLETED}>Completed</option>
              <option value={STATUS.RESERVATION_ACCEPTED}>Accepted</option>
              <option value={STATUS.RESERVATION_PAID}>Paid</option>
              <option value={STATUS.RESERVATION_PENDING}>Pending</option>
              <option value={STATUS.RESERVATION_UNPAID}>Unpaid</option>
            </select>
          ),
        },
      ]
    }
}

export default ReservationHistory;