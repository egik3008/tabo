import React from 'react';
import GoogleMapReact from 'google-map-react'

import {
    Button,
    Table,
} from 'reactstrap'
import ManageSaveButton from '../commons/ManageSaveButton';

const greatPlaceStyle = {
    // initially any map object has left top corner at lat lng coordinates
    // it's on you to set object origin to 0,0 coordinates
    position: 'absolute',
    width: 70,
    height: 70,
    left: -70 / 2,
    top: -70 / 2,

    border: '5px solid #f44336',
    borderRadius: 30,
    backgroundColor: 'white',
    textAlign: 'center',
    color: '#3f51b5',
    fontSize: 11,
    fontWeight: 'bold',
    padding: 4,
    cursor: 'pointer',
}

class MeetingPointForm extends React.Component {
    state = {
        center: {
            lat: -2.548926,
            lng: 118.0148634,
          },
          zoom: 1,
    }

    render() {
        const { photographer } = this.props;
        return (
            <div>
                <div style={{ height: '100vh', width: '100%' }}>
                <GoogleMapReact 
                    defaultCenter={this.state.center} 
                    defaultZoom={this.state.zoom}
                >
                    {'meetingPoints' in photographer
                    ? photographer.meetingPoints.map((p, i) => (
                        <div key={i} lat={p.lat} lng={p.long} style={greatPlaceStyle}>
                            {p.meetingPointName}
                        </div>
                        ))
                    : ''}
                </GoogleMapReact>
                </div>

                <Table responsive bordered className="mt-3">
                <thead>
                    <tr>
                    <th>No</th>
                    <th>Address</th>
                    <th>Action</th>
                    </tr>
                </thead>
                    <tbody>
                        {'meetingPoints' in photographer
                        ? photographer.meetingPoints.map((p, i) => (
                            <tr key={i}>
                                <td>{i + 1}</td>
                                <td>{p.meetingPointName}</td>
                                <td>
                                <Button>Edit</Button>
                                <Button
                                    color="danger"
                                    onClick={() => {
                                    const meetingPoints = photographer.meetingPoints
                                    meetingPoints.splice(i, 1)

                                    this.setState({
                                        ...photographer,
                                        meetingPoints: meetingPoints,
                                    })
                                    }}>
                                    Delete
                                </Button>
                                </td>
                            </tr>
                            ))
                        : null}
                    </tbody>
                </Table>

                <ManageSaveButton />
            </div>
        );
    }
}

export default MeetingPointForm;