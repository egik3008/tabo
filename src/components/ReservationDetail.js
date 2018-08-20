import React, { Component } from 'react'
import { Card, CardHeader, CardBody, Col, Row, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'
import axios from 'axios'
import classnames from 'classnames'
import moment from 'moment'
import 'moment/locale/id'

class ReservationDetail extends Component {
  constructor(props) {
    super(props)
    this.toggle = this.toggle.bind(this)
    this.state = {
      activeTab: 'detail',
      albums: [],
      reservation: {
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

  fetchReservation(id) {
    this.setState({
      loading: true,
    })

    axios.get(`${process.env.REACT_APP_API_HOSTNAME}/api/reservations/${id}`).then(response => {
      this.setState({
        reservation: response.data,
      })
    })
  }

  render() {
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
                    <h5>Reservation</h5>
                    <hr className="mt-0 mb-1" />
                    <dl className="row mb-2">
                      <dt className="col-sm-3">ID</dt>
                      <dd className="col-sm-9">{this.props.match.params.id}</dd>

                      <dt className="col-sm-3">Traveler</dt>
                      <dd className="col-sm-9">{this.state.reservation.traveler}</dd>

                      <dt className="col-sm-3">Created</dt>
                      <dd className="col-sm-9">
                        {moment(this.state.reservation.created)
                          .locale('id')
                          .format('lll')}
                      </dd>
                    </dl>

                    <h5>Trip Summary</h5>
                    <hr className="mt-0 mb-1" />
                    <dl className="row mb-2">
                      <dt className="col-sm-3">Schedule</dt>
                      <dd className="col-sm-9">
                        {moment(
                          'startDateTime' in this.state.reservation ? this.state.reservation.startDateTime : 'now'
                        )
                          .locale('id')
                          .format('lll')}
                      </dd>

                      <dt className="col-sm-3">Package</dt>
                      <dd className="col-sm-9">
                        <p>{this.state.reservation.package.packageName}</p>
                        <p>{this.state.reservation.package.requirement}</p>
                      </dd>

                      <dt className="col-sm-3">Destination</dt>
                      <dd className="col-sm-9">{this.state.reservation.destination}</dd>

                      <dt className="col-sm-3">Meeting Place</dt>
                      <dd className="col-sm-9">
                        <p>{this.state.reservation.meetingPoints.detail.meetingPointName}</p>
                        <p>{this.state.reservation.meetingPoints.detail.formattedAddress}</p>
                      </dd>

                      <dt className="col-sm-3">Entrant</dt>
                      <dd className="col-sm-9">
                        {Number(this.state.reservation.passengers.adults) !== 0 && (
                          <p>{this.state.reservation.passengers.adults} Adults</p>
                        )}
                        {Number(this.state.reservation.passengers.childrens) !== 0 && (
                          <p>{this.state.reservation.passengers.childrens} Children</p>
                        )}
                        {Number(this.state.reservation.passengers.infants) !== 0 && (
                          <p>{this.state.reservation.passengers.infants} Infants</p>
                        )}
                      </dd>
                    </dl>

                    <h5>Photo Album</h5>
                    <hr className="mt-0 mb-1" />
                    <dl className="row">
                      <dt className="col-sm-3">Album Delivered</dt>
                      <dd className="col-sm-9">{this.state.reservation.albumDelivered === 'Y' ? 'Yes' : 'No'}</dd>
                    </dl>

                    {this.state.reservation.albumDelivered === 'Y' && (
                      <dl className="row">
                        <dt className="col-sm-3">Created Album</dt>
                        <dd className="col-sm-9">
                          {moment(this.state.reservation.created)
                            .locale('id')
                            .format('lll')}
                        </dd>

                        <dt className="col-sm-3">Updated</dt>
                        <dd className="col-sm-9">
                          {moment(this.state.reservation.created)
                            .locale('id')
                            .format('lll')}
                        </dd>

                        <dt className="col-sm-3">Number of Photos</dt>
                        <dd className="col-sm-9">{this.state.reservation.albums.length}</dd>
                      </dl>
                    )}

                    <h5 className="mt-3">Total Summary</h5>
                    <hr className="mt-0 mb-1" />
                    <dl className="row mb-2">
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
                      <dd className="col-sm-9">-</dd>

                      <dt className="col-sm-3">Total</dt>
                      <dd className="col-sm-9">Rp. {this.state.reservation.totalPriceIDR.toLocaleString('id')}</dd>
                    </dl>
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default ReservationDetail
