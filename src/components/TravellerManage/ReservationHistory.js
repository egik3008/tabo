import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import moment from 'moment';

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
    },
    {
      Header: 'Booking Date',
      accessor: 'startDateTime',
      Cell: row =>
        moment(row.value)
          .locale('id')
          .format('lll'),
    },
    {
      Header: 'Package',
      accessor: 'packageId',
      maxWidth: 80,
    },
    {
      Header: 'Service Fee',
      accessor: 'photographerFee',
      maxWidth: 100,
      Cell: row => 'Rp. ' + Number(row.value).toLocaleString('id'),
    },
    {
      Header: 'Status',
      accessor: 'status',
      maxWidth: 120,
    },
  ];