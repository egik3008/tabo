import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Col, 
  Row, 
  Nav, 
  NavItem, 
  NavLink, 
  TabContent, 
  TabPane 
} from 'reactstrap';
import axios from 'axios'
import classnames from 'classnames'
import moment from 'moment';
import 'moment/locale/id';

import LoadingAnimation from './commons/LoadingAnimation';
import { displayDateFormat } from '../utils/commonUtils';
import { 
  countReservationDiscount, 
  countReservationDiscountForPhotographer 
} from '../utils/reservationUtils';

class ReservationDetail extends Component {
  constructor(props) {
    super(props)
    this.toggle = this.toggle.bind(this)
    this.state = {
      activeTab: 'detail',
      reservation: {
        albums: [],
        albumDelivered: 'N',
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
        photographerCurrency: "",
        paymentCurrency: "IDR",
        voucher: null,
        travellerContactPerson: null
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
    return this.state.reservation.albumDelivered === 'Y';
  }

  fetchReservation(id) {
    this.setState({
      loading: true,
    })

    axios.get(`${process.env.REACT_APP_API_HOSTNAME}/api/reservations/${id}`).then(response => {
      this.setState({
        reservation: {
          ...this.state.reservation,
          ...response.data
        },
        loading: false
      })
    })
  }

  displayPriceFormat = (price, currency) => {
    currency = currency || "IDR";
    const local = currency === "IDR" ? "id" : 'us';
    return `${currency} ${Number(price).toLocaleString(local)}`;
  }

  render() {
    const {
      voucher,
      travellerContactPerson,
      photographerCurrency,
      photographerFeeIDR,
      photographerFeeUSD,
      photographerFee,
      paymentCurrency,
      totalPriceIDR,
      totalPriceUSD,
      totalPrice,
      credit
    } = this.state.reservation;
    const tPhotographerFee = paymentCurrency === "IDR" ? photographerFeeIDR : photographerFeeUSD;
    const tTotalPrice = paymentCurrency === "IDR" ? totalPriceIDR : totalPriceUSD;

    const tDiscount = countReservationDiscount(this.state.reservation);

    const pDiscount = countReservationDiscountForPhotographer(this.state.reservation);
    const pServiceFee = totalPrice - photographerFee;
    
    
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
            <div className="tabo-detail-header">
              <h5>Reservation</h5>
              <hr className="mt-0 mb-1" />
              <dl className="row mb-2 tabo-detail-content">
                <dt className="col-sm-3">Number</dt>
                <dd className="col-sm-9">{this.props.match.params.id}</dd>

                <dt className="col-sm-3">Status</dt>
                <dd className="col-sm-9">{this.state.reservation.status}</dd>

                <dt className="col-sm-3">Photographer</dt>
                <dd className="col-sm-9">{this.state.reservation.photographer}</dd>

                <dt className="col-sm-3">Traveler</dt>
                <dd className="col-sm-9">{this.state.reservation.traveler}</dd>

                <dt className="col-sm-3">Traveler CP</dt>
                <dd className="col-sm-9">{travellerContactPerson ? travellerContactPerson : '-'}</dd>

                <dt className="col-sm-3">Created</dt>
                <dd className="col-sm-9">
                  {displayDateFormat(this.state.reservation.created)}
                </dd>

                <dt className="col-sm-3">Photo Album ID</dt>
                <dd className="col-sm-9">
                  {
                    <Link to={"/photo-album/" + this.props.match.params.id}>
                      {this.props.match.params.id}
                    </Link>
                  }
                </dd>
                
                <dt className="col-sm-3">Album Delivered</dt>
                <dd className="col-sm-9">
                  {this.isAlbumDelivered() ? displayDateFormat(this.state.reservation.updated) : "-"}
                </dd>

                <dt className="col-sm-3">Photo of album</dt>
                <dd className="col-sm-9">
                  {this.isAlbumDelivered() ? 
                    (Array.isArray(this.state.reservation.albums) ? this.state.reservation.albums.length : 0) 
                    : "-"}
                </dd>
              </dl>
            </div>

          <div className="tabo-detail-body">
            <h5>Trip Summary</h5>
              <hr className="mt-0 mb-1" />
              <dl className="row mb-2 tabo-detail-content">
                <dt className="col-sm-3">Schedule</dt>
                <dd className="col-sm-9">
                  {'startDateTime' in this.state.reservation ? displayDateFormat(this.state.reservation.startDateTime) : "-"}
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

          <div className="tabo-detail-body">
            <h5 className="mt-3">Total Summary</h5>
            <hr className="mt-0 mb-1" />

            <div className="row">
              <div className="col-md-6 col-xs-12">
                <h5 style={{
                  paddingLeft: 20, 
                  textDecoration: 'underline'
                }}>Traveller Price</h5>
                <dl className="row mb-2 tabo-detail-content">
                  <dt className="col-sm-5">Subtotal</dt>
                  <dd className="col-sm-7">{this.displayPriceFormat(tPhotographerFee, paymentCurrency)}</dd>

                  <dt className="col-sm-5">Service Fee</dt>
                  <dd className="col-sm-7">
                    {this.displayPriceFormat(tTotalPrice - tPhotographerFee + tDiscount, paymentCurrency)}
                  </dd>

                  <dt className="col-sm-5">Credit</dt>
                  <dd className="col-sm-7">
                    {this.state.reservation.credit === 0
                      ? '-'
                      : this.displayPriceFormat(credit, paymentCurrency)
                    }
                  </dd>

                  {voucher && (
                    <React.Fragment>
                    <dt className="col-sm-5">Discount</dt>
                    <dd className="col-sm-7">
                      {tDiscount === 0
                        ? '-'
                        : this.displayPriceFormat(tDiscount, paymentCurrency)
                      }
                    </dd>
                    </React.Fragment>
                  )}

                  <dt className="col-sm-5">Total</dt>
                  <dd className="col-sm-7">{this.displayPriceFormat(tTotalPrice, paymentCurrency)}</dd>
                </dl>
              </div>
              <div className="col-md-6 col-xs-12">
                <h5 style={{
                  paddingLeft: 20, 
                  textDecoration: 'underline'
                }}>Photographer Price</h5>
                <dl className="row mb-2 tabo-detail-content" style={{borderLeft: "solid"}}>
                  <dt className="col-sm-5">Subtotal</dt>
                  <dd className="col-sm-7">{this.displayPriceFormat(photographerFee, photographerCurrency)}</dd>

                  <dt className="col-sm-5">Service Fee</dt>
                  <dd className="col-sm-7">
                    {this.displayPriceFormat(pServiceFee, photographerCurrency)}
                  </dd>

                  <dt className="col-sm-5">Credit</dt>
                  <dd className="col-sm-7">
                    {this.state.reservation.credit === 0
                      ? '-'
                      : this.displayPriceFormat(credit, photographerCurrency)
                    }
                  </dd>

                  {voucher && (
                    <React.Fragment>
                    <dt className="col-sm-5">Discount</dt>
                    <dd className="col-sm-7">
                      -
                    </dd>
                    </React.Fragment>
                  )}

                  <dt className="col-sm-5">Total</dt>
                  <dd className="col-sm-7">{this.displayPriceFormat(photographerFee - pServiceFee, photographerCurrency)}</dd>
                </dl>
              </div>
            </div>
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

export default withRouter(ReservationDetail);
