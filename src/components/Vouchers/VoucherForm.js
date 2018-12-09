import React from 'react';
import { withRouter } from 'react-router-dom';
import moment from 'moment';

import db from '../../services/database';
import firebase from 'firebase';
import Swal from 'sweetalert2';
import {
    Card,
    CardHeader,
    CardBody,
    Col,
    Row,
    Form,
    FormGroup,
    Label,
    Input,
    Button,
    InputGroup,
    InputGroupAddon,
    FormText
} from 'reactstrap';

import DayPickerInput from 'react-day-picker/DayPickerInput';
import { formatDate, parseDate } from 'react-day-picker/moment';
import 'react-day-picker/lib/style.css';

import LoadingAnimation from '../commons/LoadingAnimation';
import VOUCHERS from '../../constants/vouchers';


class VoucherForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            isSubmitting: false,
            voucher: this.voucherDefault()
        }
    }

    voucherDefault() {
        return {
            code: '',
            description: '',
            type: VOUCHERS.TYPE_FIXED,
            amountIDR: '',
            amountUSD: '',
            usageLimitUser: 1,
            validStart: undefined,
            validEnd: undefined
        }
    }

    componentDidMount() {
        if (this.isEditMode()) {
            this.fetchVoucher(this.props.match.params.id)
        }
    }

    fetchVoucher = (id) => {
        this.setState({
            loading: true,
        });
        db.database().ref(VOUCHERS.NODE_VOUCHER)
        .child(id)
        .once('value', snapshot => {
            let voucher = snapshot.val();
            if (voucher) {
                voucher.id = id;
                this.setState({
                    voucher: {
                        ...voucher,
                        validStart: parseDate(voucher.validStart, 'M/D/Y'),
                        validEnd: parseDate(voucher.validEnd, 'M/D/Y')

                    },
                    loading: false
                })   
            } else {
                this.props.match.params.id = 'add';
                this.setState({
                    loading: false
                })
            }
        });


    }

    isEditMode = () => {
        return this.props.match.params.id !== 'add';
    }
    
    handleChange = (event) => {
        let fieldName, fieldValue;

        fieldName = event.target.name;
        fieldValue = event.target.value

        const isPercentField = (fieldName === 'amountIDR') && !this.isFixedType();

        fieldValue = (fieldName === 'code') ? fieldValue.toUpperCase() : fieldValue; 

        if (!isPercentField || (isPercentField && (Number(fieldValue) <= 100))) {
            let voucher = {
                ...this.state.voucher,
                [fieldName]: fieldValue
            }

            if ((fieldName === 'type') && (fieldValue !== this.state.voucher.type)) {
                voucher = {
                    ...voucher,
                    amountIDR: '',
                    amountUSD: ''
                }
            }

            this.setState({ voucher});
        }
    }

    handleSubmit = () => {
        let voucher = Object.assign({}, this.state.voucher);
        if (!this.isFixedType()) { voucher.amountUSD = voucher.amountIDR }

        const { isValid, message } = this.validate(voucher);

        if (!isValid) {
            Swal('', message, 'info');
            return;  
        }

        this.setState({ isSubmitting: true });

        voucher.usageLimitUser = voucher.usageLimitUser === "" ? null : voucher.usageLimitUser;
        voucher.updated = firebase.database.ServerValue.TIMESTAMP;
        voucher.validEnd = voucher.validEnd.toLocaleDateString();
        voucher.validStart = voucher.validStart.toLocaleDateString();

        if (this.isEditMode()) {
            db.database().ref(VOUCHERS.NODE_VOUCHER)
                .orderByChild('code')
                .equalTo(voucher.code)
                .once('value')
                .then(snap => {
                    const val = snap.val();
                    const keys = val ? Object.keys(val) : [];
                    if (!val || ((keys.length === 1) && voucher.id === keys[0])) {
                        
                        const id = voucher.id;
                        delete voucher.id;
                        db.database().ref(VOUCHERS.NODE_VOUCHER)
                            .child(id)
                            .update(voucher)
                            .then(() => {
                                this.setState({ isSubmitting: false });
                                Swal('', "Voucher updated!", 'success');
                            })
                    } else {
                        this.setState({ isSubmitting: false });
                        Swal('', "Code voucher exist!", 'info');
                    }
                })

        } else {
            db.database().ref(VOUCHERS.NODE_VOUCHER)
                .orderByChild('code')
                .equalTo(voucher.code)
                .once('value')
                .then(snap => {
                    if (!snap.exists()) {
                        this.addNewVoucher(voucher)
                        .then(() => {
                            this.setState({ 
                                isSubmitting: false,
                                voucher: this.voucherDefault() 
                            });
                            Swal('', "New voucher added!", 'success');
                        })
                    } else {
                        this.setState({ isSubmitting: false });
                        Swal('', "Code voucher exist!", 'info');
                    }
                })
        }
    }

    addNewVoucher(voucher) {
        return new Promise((resolve, reject) => {
            const newData = db
              .database()
              .ref(VOUCHERS.NODE_VOUCHER)
              .push();
    
            newData
              .set({
                created: firebase.database.ServerValue.TIMESTAMP,
                ...voucher
              })
              .then(() => {
                resolve(true);
              })
              .catch((error) => reject(error));
        });
    }

    validate = (voucher) => {
        let isValid = true, message = '';

        if (voucher.code === "") {
            isValid = false;
            message = "Code is required!"
        }

        if (isValid && voucher.amountIDR === "") {
            isValid = false;
            message = (this.isFixedType() ? "Amount IDR" : "Percent Amount") + " is required!";
        }

        if (isValid && voucher.amountUSD === "") {
            isValid = false;
            message = "Amount USD is required!";
        }

        if (isValid && (!voucher.validStart || voucher.validStart === "")) {
            isValid = false;
            message = "Valid Date is required!";
        }

        if (isValid && (!voucher.validEnd || voucher.validEnd === "")) {
            isValid = false;
            message = "Valid Date is required!";
        }

        return { isValid, message }
    }

    isFixedType = () => {
        return this.state.voucher.type === VOUCHERS.TYPE_FIXED;
    }

    showFromMonth = () => {
        const { validStart, validEnd } = this.state;
        if (!validStart) {
          return;
        }
        if (moment(validEnd).diff(moment(validStart), 'months') < 2) {
          this.validEnd.getDayPicker().showMonth(validStart);
        }
      }
      handleFromChange = (validStart) => {
        this.setState({ 
            voucher: {
                ...this.state.voucher,
                validStart
            }
        });
      }
      handleToChange = (validEnd) => {
        this.setState({ 
            voucher: {
                ...this.state.voucher,
                validEnd
            } 
        }, this.showFromMonth);
      }
      

    renderForm = () => {
        const { validStart, validEnd } = this.state.voucher;
        const modifiers = { start: validStart, end: validEnd };
        
        return (
            <Row>
                <Col md="9" >
                    <Form action="" className="form-horizontal px-3">
                    <FormGroup row>
                            <Col md="3">
                                <Label htmlFor="phoneNumber">Valid Date <span style={{color:"red"}}>*</span></Label>
                            </Col>
                            <Col xs="12" md="9">
                                <DayPickerInput
                                    value={validStart}
                                    placeholder="From"
                                    inputProps={{className: 'form-control'}}
                                    format="LL"
                                    formatDate={formatDate}
                                    parseDate={parseDate}
                                    dayPickerProps={{
                                        selectedDays: [validStart, { validStart, validEnd }],
                                        disabledDays: { after: validEnd },
                                        toMonth: validEnd,
                                        modifiers,
                                        numberOfMonths: 1,
                                        onDayClick: () => this.validEnd.getInput().focus(),
                                    }}
                                    onDayChange={this.handleFromChange}
                                />{' '}
                                —{' '}
                                <span className="InputFromTo-to">
                                <DayPickerInput
                                    ref={el => (this.validEnd = el)}
                                    value={validEnd}
                                    placeholder="To"
                                    inputProps={{className: 'form-control'}}
                                    format="LL"
                                    formatDate={formatDate}
                                    parseDate={parseDate}
                                    dayPickerProps={{
                                    selectedDays: [validStart, { validStart, validEnd }],
                                    disabledDays: { before: validStart },
                                    modifiers,
                                    month: validStart,
                                    fromMonth: validStart,
                                    numberOfMonths: 1,
                                    }}
                                    onDayChange={this.handleToChange}
                                />
                                </span>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Col md="3">
                                <Label>Code <span style={{color:"red"}}>*</span></Label>
                            </Col>
                            <Col xs="12" md="9">
                                <Input 
                                    type="text" 
                                    name="code" 
                                    value={this.state.voucher.code} 
                                    onChange={this.handleChange}
                                />
                            </Col>
                        </FormGroup>

                        <FormGroup row>
                            <Col md="3">
                            <Label>Description (optional)</Label>
                            </Col>
                            <Col xs="12" md="9">
                            <Input
                                type="textarea"
                                name="description"
                                rows="3"
                                value={this.state.voucher.description || ""}
                                placeholder="Voucher Description"
                                onChange={this.handleChange}
                            />
                            </Col>
                        </FormGroup>

                        <FormGroup row>
                            <Col md="3">
                            <Label>Amount Type <span style={{color:"red"}}>*</span></Label>
                            </Col>
                            <Col xs="12" md="4">
                                <Input value={this.state.voucher.type} type="select" name="type" onChange={this.handleChange}>
                                    <option value={VOUCHERS.TYPE_FIXED}>Fixed</option>
                                    <option value={VOUCHERS.TYPE_PERCENT}>Percent</option>
                                </Input>
                            </Col>
                        </FormGroup>

                        <FormGroup row>
                            <Col md="3">
                                <Label>{this.isFixedType() ? 'Amount IDR' : 'Percent Amount'}  <span style={{color:"red"}}>*</span></Label>
                            </Col>
                            <Col xs="12" md="4">

                                <InputGroup>
                                    <Input
                                        type="number"
                                        name="amountIDR"
                                        value={this.state.voucher.amountIDR}
                                        placeholder=""
                                        onChange={this.handleChange}
                                    />
                                    <InputGroupAddon addonType="append">{this.isFixedType() ? 'IDR' : '%'}</InputGroupAddon>
                                </InputGroup>
                            </Col>
                        </FormGroup>

                        {this.isFixedType() && (
                            <FormGroup row>
                                <Col md="3">
                                    <Label>Amount USD <span style={{color:"red"}}>*</span></Label>
                                </Col>
                                <Col xs="12" md="4">
                                    <InputGroup>
                                        <Input
                                            type="number"
                                            name="amountUSD"
                                            value={this.state.voucher.amountUSD}
                                            placeholder=""
                                            onChange={this.handleChange}
                                        />
                                        <InputGroupAddon addonType="append">USD</InputGroupAddon>
                                    </InputGroup>
                                </Col>
                            </FormGroup>
                        )}

                        <FormGroup row>
                            <Col md="3">
                                <Label>Usage limit per traveller</Label>
                            </Col>
                            <Col xs="12" md="4">
                                <Input
                                    type="number"
                                    name="usageLimitUser"
                                    value={this.state.voucher.usageLimitUser}
                                    placeholder="Unlimited usage"
                                    onChange={this.handleChange}
                                />
                                <FormText>Set empty for Unlimited usage</FormText>
                            </Col>
                        </FormGroup>

                        <FormGroup row style={{marginTop: 70}}>
                            <Col md="3" />
                            <Col xs="12" md="3">
                                <Button color="primary" block onClick={this.handleSubmit}>
                                    {this.state.isSubmitting ? 'Saving...' : 'Save'}
                                </Button>
                            </Col>
                        </FormGroup>
                    </Form>
                </Col>
            </Row>
        )
    }

    render() {
      return (
        <div className="animated fadeIn">
        <Row>
          <Col className="mt-2">
            <Card>
              <CardHeader>
                <h3>
                  <strong>{this.isEditMode() ? 'Edit' : 'Add New'} Voucher</strong>
                </h3>
              </CardHeader>
              <CardBody>
                {!this.state.loading ? (
                  this.renderForm()
                ) : (
                  <LoadingAnimation />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
      )
    };
}

export default withRouter(VoucherForm);