import React, { Component } from 'react';
import db from '../../services/database';
import ReactTable from 'react-table';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/id';
import 'react-table/react-table.css';
import { filterCaseInsensitive } from '../../utils/reactTable';

class PhotoAlbums extends Component {
  constructor() {
    super()
    this.state = {
      filtered: [],
      photoAlbums: {
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
      photoAlbums: { ...prevState.photoAlbums, loading: true },
    }));

    const albumRef = db.database().ref('albums');
    const reservationRef = db.database().ref('reservations');

    albumRef.once('value').then(snap => {
      let data = [];
      let albums = snap.val();
      Object.keys(albums).forEach(async key => {
        // await reservationRef.child(key).once('value').then(snap => {
        //   const rsrv = snap.val();
        //   if (rsrv) {
        //     let item = {
        //       id: key,
        //       albums: albums[key],
        //       traveller: rsrv.uidMapping[rsrv.travellerId].displayName,
        //       photographer: rsrv.uidMapping[rsrv.photographerId].displayName
        //     }
        //     data.push(item);
        //   }
        // });

        let item = {
          id: key,
          albums: albums[key],
          traveller: "",
          photographer: ""
        }
        data.push(item);
      });
      this.setState(prevState => {
        return {
          photoAlbums: {
            ...prevState.photoAlbums,
            loading: false,
            loaded: true,
            data: data,
          },
        }
      })
    });

    //   this.setState(prevState => {
    //     return {
    //       photoAlbums: {
    //         ...prevState.photoAlbums,
    //         loading: false,
    //         loaded: true,
    //         data: response.data,
    //       },
    //     }
    //   })



    // axios.get(`${process.env.REACT_APP_API_HOSTNAME}/api/reservations`).then(response => {
    //   // console.log(response.data);
    //   this.setState(prevState => {
    //     return {
    //       photoAlbums: {
    //         ...prevState.photoAlbums,
    //         loading: false,
    //         loaded: true,
    //         data: response.data,
    //       },
    //     }
    //   })
    // })
    
  }

  render() {
    console.log(this.state.photoAlbums.data[0]);
    const columns = [
      {
        Header: 'ID Photo Album',
        accessor: 'id',
      },
      {
        Header: 'ID Reservation',
        accessor: 'id'
      },
      {
        Header: 'Number of Photos',
        id: 'numberOfPhotos',
        accessor: d => {
          return d.albums.length
        }
      },
      {
        Header: 'Folder Size Default',
        accessor: 'photographer',
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
        Header: 'Traveller',
        accessor: 'traveller',
      },
      {
        Header: 'Photographer',
        accessor: 'photographer',
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
            <Link to={'/photo-album/' + row.value}>
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
                  <strong>Photo Album List</strong>
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
                  data={this.state.photoAlbums.data}
                  loading={this.state.photoAlbums.loading}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default PhotoAlbums
