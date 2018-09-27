import React, { Component } from 'react'
import { Card, CardHeader, CardBody, Col, Row, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'
import axios from 'axios'
import classnames from 'classnames'
import moment from 'moment';
import 'moment/locale/id';

import LoadingAnimation from './commons/LoadingAnimation';

class ReservationDetail extends Component {
  constructor(props) {
    super(props)
    this.toggle = this.toggle.bind(this)
    this.state = {
      activeTab: 'detail',
      reservation: {
        albums: [],
        credit: 0,
        meetingPoints: {
          detail: {
            formattedAddress: '',
            meetingPointName: '',
          },
        },
        package: {
          packageName: '',
          requirement: '',
        },
        passengers: {
          adults: 0,
          childrens: 0,
          infants: 0,
        },
        photographerFee: 0,
        photographerFeeIDR: 0,
        photographerFeeUSD: 0,
        totalPrice: 0,
        totalPriceIDR: 0,
        totalPriceUSD: 0,
      },
      loading: false,
    }
  }

  componentWillMount() {
    this.fetchReservation(this.props.match.params.id)
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      })
    }
  }

  isAlbumDelivered = () => {
    this.state.reservation.albumDelivered === 'Y';
  }

  fetchReservation(id) {
    this.setState({
      loading: true,
    })

    axios.get(`${process.env.REACT_APP_API_HOSTNAME}/api/reservations/${id}`).then(response => {
      this.setState({
        reservation: response.data,
        loading: false
      })
    })
  }

  displayDateFormat = (date) => {
    return date ? (
      <React.Fragment>
        {moment(date).format('DD/MM/YYYY')}
        <br/>
        {moment(date).format('HH:mm:ss')}
      </React.Fragment>
    ): '';
  }

  render() {
    const renderReservationDetail = (
      <React.Fragment>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === 'detail' })}
              onClick={() => {
                this.toggle('detail')
              }}>
              Detail
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId="detail">
            <div className="reservation-detail-header">
              <h5>Reservation</h5>
              <hr className="mt-0 mb-1" />
              <dl className="row mb-2 reservation-detail-content">
                <dt className="col-sm-3">Number</dt>
                <dd className="col-sm-9">{this.props.match.params.id}</dd>

                <dt className="col-sm-3">Photographer</dt>
                <dd className="col-sm-9">{this.state.reservation.photographer}</dd>

                <dt className="col-sm-3">Traveler</dt>
                <dd className="col-sm-9">{this.state.reservation.traveler}</dd>

                <dt className="col-sm-3">Created</dt>
                <dd className="col-sm-9">
                  {this.displayDateFormat(this.state.reservation.created)}
                </dd>

                <dt className="col-sm-3">Photo Album ID</dt>
                <dd className="col-sm-9">{this.props.match.params.id}</dd>
                
                <dt className="col-sm-3">Album Delivered</dt>
                <dd className="col-sm-9">
                  {this.isAlbumDelivered() ? this.displayDateFormat(this.state.reservation.updated) : "-"}
                </dd>
              </dl>
            </div>

          <div className="reservation-detail-body">
            <h5>Trip Summary</h5>
              <hr className="mt-0 mb-1" />
              <dl className="row mb-2 reservation-detail-content">
                <dt className="col-sm-3">Schedule</dt>
                <dd className="col-sm-9">
                  {'startDateTime' in this.state.reservation ? this.displayDateFormat(this.state.reservation.startDateTime) : "-"}
                </dd>

                <dt className="col-sm-3">Package</dt>
                <dd className="col-sm-9">
                  {this.state.reservation.package.packageName}
                  <br/>
                  {this.state.reservation.package.requirement}
                </dd>

                <dt className="col-sm-3">Destination</dt>
                <dd className="col-sm-9">{this.state.reservation.destination}</dd>

                {'meetingPoints' in this.state.reservation && (
                  <React.Fragment>
                    <dt className="col-sm-3">Meeting Place</dt>
                    <dd className="col-sm-9">
                      <p>{this.state.reservation.meetingPoints.detail.meetingPointName}</p>
                      <p>{this.state.reservation.meetingPoints.detail.formattedAddress}</p>
                    </dd>
                  </React.Fragment>
                )}

                {'passengers' in this.state.reservation && (
                  <React.Fragment>
                    <dt className="col-sm-3">Entrant</dt>
                    <dd className="col-sm-9">
                      {Number(this.state.reservation.passengers.adults) !== 0 && (
                        <React.Fragment>{this.state.reservation.passengers.adults} Adults</React.Fragment>
                      )}
                      {Number(this.state.reservation.passengers.childrens) !== 0 && (
                        <React.Fragment><br/>{this.state.reservation.passengers.childrens} Children</React.Fragment>
                      )}
                      {Number(this.state.reservation.passengers.infants) !== 0 && (
                        <React.Fragment><br/>{this.state.reservation.passengers.infants} Infants</React.Fragment>
                      )}
                    </dd>
                  </React.Fragment>
                )}
              </dl>
          </div>

          <div className="reservation-detail-body">
            <h5 className="mt-3">Total Summary</h5>
            <hr className="mt-0 mb-1" />
            <dl className="row mb-2 reservation-detail-content">
              <dt className="col-sm-3">Subtotal</dt>
              <dd className="col-sm-9">Rp. {this.state.reservation.photographerFeeIDR.toLocaleString('id')}</dd>

              <dt className="col-sm-3">Service Fee</dt>
              <dd className="col-sm-9">
                Rp.{' '}
                {(
                  this.state.reservation.totalPriceIDR - this.state.reservation.photographerFeeIDR
                ).toLocaleString('id')}
              </dd>

              <dt className="col-sm-3">Credit</dt>
              <dd className="col-sm-9">
                {this.state.reservation.credit === 0
                  ? '-'
                  : 'Rp. ' + this.state.reservation.credit.toLocaleString('id')}
              </dd>

              <dt className="col-sm-3">Total</dt>
              <dd className="col-sm-9">Rp. {this.state.reservation.totalPriceIDR.toLocaleString('id')}</dd>
            </dl>
          </div>
          </TabPane>
        </TabContent>
      </React.Fragment>
    );

    return (
      <div className="animated fadeIn">
        <Row>
          <Col className="mt-2">
            <Card>
              <CardHeader>
                <h3>
                  <strong>Reservation Detail</strong>
                </h3>
              </CardHeader>
              <CardBody>
                { this.state.loading ? <LoadingAnimation /> : renderReservationDetail}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default ReservationDetail
