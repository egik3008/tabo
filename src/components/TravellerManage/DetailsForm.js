import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import Select from 'react-select';
import CreatableSelect from 'react-select/lib/Creatable';

import {
    Col,
    Row,
    Form,
    FormGroup,
    FormText,
    Label,
    Input,
    InputGroup,
    InputGroupAddon
} from 'reactstrap';

import ManageSaveButton from '../commons/ManageSaveButton';
import { USER_TYPE } from '../../constants/user';
import { selectCountries } from '../../store/selector/countries';
import { LANGUAGES } from '../../constants/commons';


const MAX_TEXT_LENGTH = 5000;
const API_SERVICE_URL = process.env.REACT_APP_API_HOSTNAME + "/api/";

class DetailsForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            auth: {
                password: '',
                passwordConfirm: ''
            },
            user: {
                uid: '',
                displayName: '',
                email: '',
                country: '',
                phoneDialCode: '',
                phoneNumber: '',
                address: '',
                currency: '',
                language: '',
                enable: 1,
                reason: '',
                blockedDate: null,

            },
            displayBlockedReason: '',
            reasonBlockLength: MAX_TEXT_LENGTH,
            initialStatus: 0,
            submittingNewUser: false
        }
    }

    componentDidMount() {
        this.setDefaultState(this.props.traveller);
    }

    setDefaultState = (user) => {
        const currentReasonLength = user.reason ? user.reason.length : 0;
        const remaining = this.state.reasonBlockLength - currentReasonLength;
        
        this.setState({
          user: {
            ...this.state.user,
            ...user
          },
          reasonBlockLength: remaining,
          initialStatus: user.enable,
        displayBlockedReason: user.reason,
        });
    }

    isEditMode = () => {
        return this.state.user.uid !== '';
    }

    isUserBlocked = () => {
        return Number(this.state.user.enable) === 0;
    }
    
    isShowBlockedDateAndReason = () => {
        return (this.isUserBlocked() && (Number(this.state.initialStatus) === 0));
    }

    handleChangeCounterText = (event) => {
        let inputValue = event.target.value;
    
        if (event.target.name === 'reason') {
          const len = inputValue.length
          const remaining = MAX_TEXT_LENGTH - len
          this.setState({
            reasonBlockLength: remaining,
          })
        }
        this.handleChange(event);
    }

    handleLanguagesChange = (selected) => {
        const arrSelected = selected.map(item => {
          return item.value
        });
    
        this.setState({
          user: {
            ...this.state.user,
            language: arrSelected.toString(),
          },
        })
    }

    getSelectValue = (value, options) => {
        return options.find(item => {
            return item.value === value;
        })
    }

    handleCountryChange = (selectedChoice) => {
        if (selectedChoice) {
          let { countriesData: {currencies} } = this.props;
          this.setState({
            user: {
              ...this.state.user,
              country: selectedChoice.value,
              currency: currencies[selectedChoice.value],
              phoneDialCode: selectedChoice.phoneDialCode
            }
          });
        }
    }

    handleChange = (event) => {
        let fieldName, fieldValue;

        fieldName = event.target.name;
        fieldValue = event.target.value

        if (fieldName in this.state.user) {
            this.setState({
                user: {
                ...this.state.user,
                [fieldName]: fieldValue
                }
            });
        }

        if (fieldName in this.state.auth) {
            this.setState({
                userAuth: {
                ...this.state.userAuth,
                [fieldName]: fieldValue
                }
            });
        }
    }

    handleSubmit = () => {
        let { user } = this.state;
        if ((user.displayName === "") || (user.email === "")) {
            alert("Field Name & Email are mandatory");
            return;
        }

        user = this.checkIfUserStatusChange();

        this.props.onSubmit(user);
    }

    checkIfUserStatusChange = () => {
        const { user, initialStatus } = this.state;
        if (Number(user.enable) !== initialStatus) {
          if (Number(user.enable) === 0) {
            user.blockedDate = moment().format("DD/MM/YYYY");
            this.setState({
              initialStatus: 0,
              displayBlockedReason: user.reason
            });
          } else {
            this.setState({
              initialStatus: 1,
              user: {
                ...user,
                reason: ''
              },
              displayBlockedReason: ''
            });
          }
        } else {
          this.setState({displayBlockedReason: user.reason});
        }
        return user;
      }

    render() {
      let { countriesData: { countries } } = this.props;
      return (
        <Row>
            <Col md="9" >
                <Form action="" className="form-horizontal px-3">
                    {this.isEditMode() && (
                        <FormGroup row>
                            <Col md="3">
                                <Label htmlFor="id">ID</Label>
                            </Col>
                            <Col xs="12" md="9">
                                <Input type="text" id="id" name="id" placeholder={this.state.user.uid} disabled />
                            </Col>
                        </FormGroup>
                    )}

                    <FormGroup row>
                        <Col md="3">
                        <Label htmlFor="displayName">Name</Label>
                        </Col>
                        <Col xs="12" md="9">
                        <Input
                            type="text"
                            id="displayName"
                            name="displayName"
                            value={this.state.user.displayName}
                            placeholder=""
                            onChange={this.handleChange}
                        />
                        </Col>
                    </FormGroup>

                    <FormGroup row>
                        <Col md="3">
                        <Label htmlFor="email">Email</Label>
                        </Col>
                        <Col xs="12" md="9">
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            value={this.state.user.email}
                            placeholder=""
                            onChange={this.handleChange}
                        />
                        </Col>
                    </FormGroup>

                    <FormGroup row>
                    <Col md="3">
                        <Label htmlFor="country">Country</Label>
                    </Col>
                    <Col xs="12" md="9">
                        <Select
                        id="country"
                        name="country"
                        value={this.getSelectValue(this.state.user.country, countries)}
                        options={countries}
                        clearable={false}
                        onChange={this.handleCountryChange}
                        />
                    </Col>
                    </FormGroup>

                    <FormGroup row>
                    <Col md="3">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                    </Col>
                    <Col xs="12" md="9">
                        <InputGroup>
                        <InputGroupAddon addonType="prepend">
                            {this.state.user.phoneDialCode || "-"}
                        </InputGroupAddon>
                        <Input
                            type="number"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={this.state.user.phoneNumber}
                            placeholder="Insert phone"
                            onChange={this.handleChange}
                        />
                        </InputGroup>
                    </Col>
                    </FormGroup>

                    <FormGroup row>
                        <Col md="3">
                        <Label htmlFor="address">Address</Label>
                        </Col>
                        <Col xs="12" md="9">
                            <Input
                                type="text"
                                id="address"
                                name="address"
                                value={this.state.user.address}
                                placeholder="Insert address"
                                onChange={this.handleChange}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup row>
                        <Col md="3">
                        <Label htmlFor="currency">Currency</Label>
                        </Col>
                        <Col xs="12" md="9">
                            <Input
                                type="text"
                                id="currency"
                                name="currency"
                                value={this.state.user.currency}
                                disabled
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup row>
                        <Col md="3">
                        <Label htmlFor="language">Language</Label>
                        </Col>
                        <Col xs="12" md="9">
                        <CreatableSelect
                            value={this.state.user.language ? 
                                this.state.user.language.split(',').map(item => {
                                return { value: item, label: item }
                            }) : ''
                            }
                            options={LANGUAGES.map(item => ({
                                label: item,
                                value: item,
                                style: {
                                margin: "5px 0px 5px 5px"
                                }
                            }))}
                            onChange={this.handleLanguagesChange}
                            allowCreate={true}
                            isMulti
                        />
                        </Col>
                    </FormGroup>

                    <FormGroup row>
                    <Col>
                        <Row>
                        <Col md="6">
                            <Label htmlFor="enable">Status</Label>
                        </Col>
                        <Col xs="12" md="6">
                            <Input
                                type="select"
                                id="enable"
                                name="enable"
                                value={this.state.user.enable}
                                onChange={this.handleChange}
                            >
                                <option value="1">Active</option>
                                <option value="0">Blocked</option>
                            </Input>
                        </Col>
                        </Row>
                    </Col>
                    <Col>
                        {this.isShowBlockedDateAndReason() && (
                        <span>
                            <strong>
                            {this.state.user.blockedDate}
                            </strong>
                            <p className="user-blocked-reason">{this.state.displayBlockedReason}</p>
                        </span>
                        )}
                    </Col>
                    </FormGroup>

                    {this.isUserBlocked() && (
                    <FormGroup row>
                        <Col md="3">
                            <Label htmlFor="reason">Reason</Label>
                        </Col>
                        <Col xs="12" md="9">
                        <Input
                            type="textarea"
                            id="reason"
                            name="reason"
                            maxLength={MAX_TEXT_LENGTH}
                            value={this.state.user.reason || ""}
                            onChange={this.handleChangeCounterText}
                            placeholder="Max 5000 characters"
                        />
                        <FormText className="help-block">Characters left: {this.state.reasonBlockLength} </FormText>
                        </Col>
                    </FormGroup>
                    )}
                </Form>
            </Col>
            <ManageSaveButton
                onClick={this.handleSubmit}
                isSubmitting={this.props.isSubmitting}
            />
        </Row>
      )
    };
}

const mapsStateToProps = (store) => ({
    countriesData: selectCountries(store.commons.countries)
  });

export default connect(mapsStateToProps)(DetailsForm);