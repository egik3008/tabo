import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
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
  TabPane, 
  Input 
} from 'reactstrap';
import firebase from '../../services/database';
import classnames from 'classnames';
import moment from 'moment';
import 'moment/locale/id';
import firebaseObj from 'firebase';
import Swal from 'sweetalert2';

import CASHOUT from '../../constants/cashout';
import { displayMethodCashout } from '../../utils/cashoutUtils';
import LoadingAnimation from '../commons/LoadingAnimation';
import SaveButton from '../commons/ManageSaveButton';

class CashoutDetail extends Component {
  constructor(props) {
    super(props)
    this.toggle = this.toggle.bind(this)
    this.state = {
      activeTab: 'detail',
      cashout: {
        
      },
      updateStatus: '',
      loading: false,
      isSubmitting: false
    }
  }

  componentWillMount() {
    this.fetchcashout(this.props.match.params.id)
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      })
    }
  }

  fetchcashout(id) {
    this.setState({
      loading: true,
    });

    const db = firebase.database();
    db.ref('cashout')
        .child(id)
        .once('value', snapshot => {
            let cashout = snapshot.val();
            cashout.id = id;

            db.ref('user_metadata')
                .child(cashout.photographerId)
                .once('value', userSnapshot => {
                    const user = userSnapshot.val();
                    cashout.photographerEmail = user.email;
                    this.setState({
                        cashout: {
                            ...this.state.cashout,
                            ...cashout
                        },
                        loading: false
                    })
                })
        });
  }

  handleChangeStatus = (event) => {
      const newStatus = event.target.value;
      this.setState({
          updateStatus: newStatus
      })
  }

  handleUpdateStatus = () => {
    const newStatus = this.state.updateStatus;
    if (!newStatus) {
        Swal('', 'Please select the status first!', 'info');
    } else if (newStatus === this.state.cashout.status) {
        Swal('', 'You selected the current cashout status. Status not updated.', 'info')
    } else {
        this.setState({isSubmitting: true});
        const db = firebase.database();
        db.ref('cashout')
            .child(this.state.cashout.id)
            .update({
                status: newStatus,
                updated: firebaseObj.database.ServerValue.TIMESTAMP
            }, () => {
                Swal('Success!', 'Cashout Status is updated..', 'success');
                this.setState({
                    cashout: {
                        ...this.state.cashout,
                        status: newStatus,
                        updated: new Date().getTime()
                    },
                    isSubmitting: false,
                    updateStatus: ''
                })
            })
    }
  }

  displayDateFormat = (date) => {
    return date ? (
      <React.Fragment>
        {moment(date).format('DD/MM/YYYY')}
        <br/>
        {moment(date).format('HH:mm:ss')}
      </React.Fragment>
    ): '-';
  }

  displayPriceFormat = (price) => {
    const {currency} = this.state.cashout;
    return `${currency} ${price}`;
  }

  isBankMethod = () => {
    return this.state.cashout.paymentType === CASHOUT.BANK_METHOD;
  }

  displayPaymentBank = () => {
    if (this.isBankMethod()) {
        return this.state.cashout.bankName;
    }
    return 'Paypal';
  }

  displayBankAccount = () => {
    if (this.isBankMethod()) {
        return this.state.cashout.bankAccountNumber;
    }
    return this.state.cashout.paypalEmail;
  }

  render() {
    const renderCashoutDetail = (
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
              <h5>Cashout</h5>
              <hr className="mt-0 mb-1" />
              <dl className="row mb-2 tabo-detail-content">
                <dt className="col-sm-3">Number</dt>
                <dd className="col-sm-9">{this.props.match.params.id}</dd>

                <dt className="col-sm-3">Requested Amount</dt>
                <dd className="col-sm-9">{(this.state.cashout.currency || "IDR") + " "+ this.state.cashout.amount}</dd>

                <dt className="col-sm-3">Photographer</dt>
                <dd className="col-sm-9">{this.state.cashout.photographerDisplayName}</dd>

                <dt className="col-sm-3">e-Mail</dt>
                <dd className="col-sm-9">{this.state.cashout.photographerEmail}</dd>

                <dt className="col-sm-3">Status</dt>
                <dd className="col-sm-9">
                  {this.state.cashout.status}
                </dd>
            
              </dl>
            </div>

          <div className="tabo-detail-body">
            <h5>Cash Out Summary</h5>
              <hr className="mt-0 mb-1" />
              <dl className="row mb-2 tabo-detail-content">
                <dt className="col-sm-3">Method</dt>
                <dd className="col-sm-9">
                  {displayMethodCashout(this.state.cashout.paymentType)}
                </dd>

                <dt className="col-sm-3">Payment Bank</dt>
                <dd className="col-sm-9">
                  {this.displayPaymentBank()}
                </dd>

                <dt className="col-sm-3">Bank Account</dt>
                <dd className="col-sm-9">{this.displayBankAccount()}</dd>

                <dt className="col-sm-3">Created</dt>
                <dd className="col-sm-9">
                  {this.displayDateFormat(this.state.cashout.created)}
                </dd>

                <dt className="col-sm-3">Updated</dt>
                <dd className="col-sm-9">
                  {this.displayDateFormat(this.state.cashout.updated)}
                </dd>

                <dt className="col-sm-3">Update Status</dt>
                <dd className="col-sm-3">
                    <Input value={this.state.updateStatus} type="select" name="select" onChange={this.handleChangeStatus}>
                        <option></option>
                        <option value={CASHOUT.STATUS_REQUESTED}>
                            {CASHOUT.STATUS_REQUESTED}
                        </option>
                        <option value={CASHOUT.STATUS_PROCESSING}>
                            {CASHOUT.STATUS_PROCESSING}
                        </option>
                        <option value={CASHOUT.STATUS_DONE}>
                            {CASHOUT.STATUS_DONE}
                        </option>
                    </Input>
                </dd>
              </dl>

              <SaveButton
                onClick={this.handleUpdateStatus}
                isSubmitting={this.state.isSubmitting}
              />
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
                  <strong>Detail Cash Out</strong>
                </h3>
              </CardHeader>
              <CardBody>
                { this.state.loading ? <LoadingAnimation /> : renderCashoutDetail}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default withRouter(CashoutDetail);
