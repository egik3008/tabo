import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import moment from 'moment';

class ReservationHistory extends React.Component  {

    render() {
        const { photographer } = this.props;
        return (
            <ReactTable
              className="-striped -hightlight"
              columns={this.historyColumns()}
              sortable={true}
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
          accessor: 'uidMapping',
          Cell: row => {
            const keys = Object.keys(row.value)
            const photographerIndex = keys.indexOf(this.props.photographer.userMetadata.uid)
            const travelerIndex = photographerIndex === 0 ? 1 : 0
            const travelerId = keys[travelerIndex]
            return <span>{row.value[travelerId].displayName}</span>
          },
        },
        {
          Header: 'Destination',
          accessor: 'destination',
          maxWidth: 180,
        },
        {
          Header: 'Email',
          accessor: 'uidMapping',
          Cell: row => {
            const keys = Object.keys(row.value)
            const photographerIndex = keys.indexOf(this.props.photographer.userMetadata.uid)
            const travelerIndex = photographerIndex === 0 ? 1 : 0
            const travelerId = keys[travelerIndex]
            return <span>{row.value[travelerId].email}</span>
          },
        },
        {
          Header: 'Currency',
          maxWidth: 80,
        },
        {
          Header: 'Updated',
          accessor: 'created',
          Cell: row =>
            moment(row.value)
              .locale('id')
              .format('lll'),
        },
        {
          Header: 'Status',
          accessor: 'status',
          maxWidth: 80,
        },
      ]
    }
}

export default ReservationHistory;