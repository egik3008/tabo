import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import moment from 'moment';
import STATUS from '../../constants/reservations';
import {filterCaseInsensitive} from '../../utils/reactTable';

class ReservationHistory extends React.Component {
    render() {
      return (
        <ReactTable
            className="-striped -hightlight"
            columns={historyColumns}
            sortable={true}
            defaultSorted={[
              {
                id: 'startDateTime',
                desc: true,
              },
            ]}
            filterable={true}
            defaultFilterMethod={filterCaseInsensitive}
            defaultPageSize={10}
            data={this.props.reservationHistory}
          //   loading={this.state.loading}
        />
      )
    };
}

export default ReservationHistory;

const historyColumns = [
    {
      Header: 'ID Reservation',
      accessor: 'reservationId',
    },
    {
      Header: 'ID Photographer',
      accessor: 'photographerId',
    },
    {
      Header: 'Date',
      accessor: 'created',
      Cell: row =>
        moment(row.value)
          .locale('id')
          .format('lll'),
      filterMethod: (filter, row) => {
        console.log(row);
        const dateString = row.created ? moment(row.created)
          .locale('id')
          .format('lll') : '-';
        return String(dateString.toLowerCase()).includes(filter.value.toLowerCase())
      },
    },
    {
      Header: 'Booking Date',
      accessor: 'startDateTime',
      Cell: row =>
        moment(row.value)
          .locale('id')
          .format('lll'),
      filterMethod: (filter, row) => {
        const dateString = row.startDateTime ? moment(row.startDateTime)
          .locale('id')
          .format('lll') : '-';
        return String(dateString.toLowerCase()).includes(filter.value.toLowerCase())
      },
    },
    {
      Header: 'Package',
      accessor: 'packageId',
      maxWidth: 80,
    },
    {
      Header: 'Service Fee',
      maxWidth: 100,
      id: 'fee',
      accessor: d => {
        let currency = "IDR";
        if (d.paymentCurrency) currency = d.paymentCurrency;
        return currency === "IDR" ? Number(d.totalPriceIDR) - Number(d.photographerFeeIDR) : Number(d.totalPriceUSD) - Number(d.photographerFeeUSD)
      },
      Cell: cellInfo => {
        let currency = "IDR";
        if (cellInfo.original.paymentCurrency) currency = cellInfo.original.paymentCurrency;
        const serviceFee = currency === "IDR" ? Number(cellInfo.original.totalPriceIDR) - Number(cellInfo.original.photographerFeeIDR) : Number(cellInfo.original.totalPriceUSD) - Number(cellInfo.original.photographerFeeUSD);
        return currency + " " + (currency === "IDR" ? serviceFee.toLocaleString('id') : serviceFee.toLocaleString('us'));
      },
      filterMethod: (filter, row) => {
        if (filter.value === 'all') {
          return true
        }
        if (filter.value === "IDR") 
          return row._original.paymentCurrency ? 
            (row._original.paymentCurrency === "IDR") : true
        else if (filter.value === "USD") 
          return row._original.paymentCurrency ? 
            (row._original.paymentCurrency === "USD") : false
      },
      Filter: ({ filter, onChange }) => (
        <select
          onChange={event => onChange(event.target.value)}
          style={{ width: '100%', height: "100%" }}
          value={filter ? filter.value : 'all'}>
          <option value="all">Show All</option>
          <option value="IDR">IDR</option>
          <option value="USD">USD</option>
        </select>
      ),
    },
    {
      Header: 'Credit',
      maxWidth: 100,
      id: 'fee',
      accessor: d => {
        let currency = "IDR";
        if (d.paymentCurrency) currency = d.paymentCurrency;
        return currency === "IDR" ? Number(d.totalPriceIDR) - Number(d.photographerFeeIDR) : Number(d.totalPriceUSD) - Number(d.photographerFeeUSD)
      },
      Cell: cellInfo => {
        let currency = "IDR";
        if (cellInfo.original.paymentCurrency) currency = cellInfo.original.paymentCurrency;
        return currency + " 0";
      },
      filterMethod: (filter, row) => {
        if (filter.value === 'all') {
          return true
        }
        if (filter.value === "IDR") 
          return row._original.paymentCurrency ? 
            (row._original.paymentCurrency === "IDR") : true
        else if (filter.value === "USD") 
          return row._original.paymentCurrency ? 
            (row._original.paymentCurrency === "USD") : false
      },
      Filter: ({ filter, onChange }) => (
        <select
          onChange={event => onChange(event.target.value)}
          style={{ width: '100%', height: "100%" }}
          value={filter ? filter.value : 'all'}>
          <option value="all">Show All</option>
          <option value="IDR">IDR</option>
          <option value="USD">USD</option>
        </select>
      ),
    },
    {
      Header: 'Total',
      maxWidth: 100,
      id: 'fee',
      accessor: d => {
        let currency = "IDR";
        if (d.paymentCurrency) currency = d.paymentCurrency;
        return currency === "IDR" ? Number(d.totalPriceIDR) : Number(d.totalPriceUSD)
      },
      Cell: cellInfo => {
        let currency = "IDR";
        if (cellInfo.original.paymentCurrency) currency = cellInfo.original.paymentCurrency;
        const total = currency === "IDR" ? Number(cellInfo.original.totalPriceIDR) : Number(cellInfo.original.totalPriceUSD);
        return currency + " " + (currency === "IDR" ? total.toLocaleString('id') : total.toLocaleString('us'));
      },
      filterMethod: (filter, row) => {
        if (filter.value === 'all') {
          return true
        }
        if (filter.value === "IDR") 
          return row._original.paymentCurrency ? 
            (row._original.paymentCurrency === "IDR") : true
        else if (filter.value === "USD") 
          return row._original.paymentCurrency ? 
            (row._original.paymentCurrency === "USD") : false
      },
      Filter: ({ filter, onChange }) => (
        <select
          onChange={event => onChange(event.target.value)}
          style={{ width: '100%', height: "100%" }}
          value={filter ? filter.value : 'all'}>
          <option value="all">Show All</option>
          <option value="IDR">IDR</option>
          <option value="USD">USD</option>
        </select>
      ),
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
  ];