import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router'
import axios from 'axios';
import sha1 from 'js-sha1';
import Swal from 'sweetalert2';
import Select from 'react-select';
import AsyncSelect from 'react-select/lib/Async';
import CreatableSelect from 'react-select/lib/Creatable';
import moment from 'moment';

import {
  Card,
  CardBody,
  CardImg,
  Col,
  Row,
  Form,
  FormGroup,
  FormText,
  Label,
  Input,
  CustomInput,
  Button,
  InputGroup,
  InputGroupAddon
} from 'reactstrap';

import defaultUserPhoto from '../../assets/img/avatar/user_default.png';
import ManageSaveButton from '../commons/ManageSaveButton';

import { selectCountries } from '../../store/selector/countries';

import { USER_TYPE } from '../../constants/user';
import { LANGUAGES } from '../../constants/commons';

const MAX_TEXT_LENGTH = 5000;
const API_SERVICE_URL = process.env.REACT_APP_API_HOSTNAME + "/api/";

class DetailsForm extends React.Component {

  state = {
    userAuth: {
      password: '',
      passwordConfirm: ''
    },
    userMetadata: {
      uid: '',
      displayName: '',
      email: '',
      phoneDialCode: '',
      phoneNumber: '',
      country: '',
      countryName: '',
      locationAdmLevel1: '',
      locationAdmLevel2: '',
      locationMerge: '',
      currency: '',
      photoProfileUrl: '',
      enable: 1,
      reason: '',
      blockedDate: null,
    },
    photographer: {
      selfDescription: '',
      languages: [],
    },
    countryExt: {
      continent: '',
    },
    newPhotoProfile: {
      fileObject: null,
      fileName: '',
      preview: null
    },
    initialStatus: 1, // status user (active/blocked)
    displayBlockedReason: '',
    reasonBlockLength: MAX_TEXT_LENGTH,
    aboutCharLeft: MAX_TEXT_LENGTH,
    changePassword: false,
    uploadingPhotoProfile: false,
    submittingNewUser: false,
  }

  setDefaultState = (photographer) => {
    const { userMetadata } = photographer;
    const currentReasonLength = userMetadata.reason ? userMetadata.reason.length : 0;
    const currentSelfDescLength = userMetadata.selfDescription ? userMetadata.selfDescription.length : 0;

    const remaining = this.state.reasonBlockLength - currentReasonLength;
    const aboutCharRemaining = this.state.aboutCharLeft - currentSelfDescLength;
    
    this.setState({
      userMetadata: {
        ...this.state.userMetadata,
        ...userMetadata
      },
      photographer: {
        selfDescription: photographer.selfDescription,
        languages: photographer.languages
      },
      initialStatus: photographer.userMetadata.enable,
      displayBlockedReason: photographer.userMetadata.reason,
      reasonBlockLength: remaining,
      aboutCharLeft: aboutCharRemaining
    });
  }

  componentDidMount() {
    const { photographer } = this.props;
    this.setDefaultState(photographer);
  }

  isEditMode = () => {
    return this.state.userMetadata.uid !== '';
  }

  isUserBlocked = () => {
    return Number(this.state.userMetadata.enable) === 0;
  }

  isShowBlockedDateAndReason = () => {
    return (this.isUserBlocked() && (Number(this.state.initialStatus) === 0));
  }

  handleChange = (event) => {
    let fieldName, fieldValue;

    // handle select event => doesnt have target.name
    if (event.label) {
      fieldName = "phoneDialCode";
      fieldValue = event.value;
    } else {
      fieldName = event.target.name;
      fieldValue = event.target.value
    }

    if (fieldName in this.state.userMetadata) {
      this.setState({
        userMetadata: {
          ...this.state.userMetadata,
          [fieldName]: fieldValue
        }
      });
    }

    if (fieldName in this.state.photographer) {
      this.setState({
        photographer: {
          ...this.state.photographer,
          [fieldName]: fieldValue
        }
      });
    }

    if (fieldName in this.state.userAuth) {
      this.setState({
        userAuth: {
          ...this.state.userAuth,
          [fieldName]: fieldValue
        }
      });
    }
  }

  handleSubmit = () => {
    let { userMetadata, photographer } = this.state;
    let userAuth = null;

    // validate field mandatory
    if ((userMetadata.displayName === "") || (userMetadata.email === "")) {
      alert("Field Name & Email are mandatory");
      return;
    }

    // validate password
    if (!this.isEditMode() || this.state.changePassword) {
      const { password, passwordConfirm } = this.state.userAuth;
      if (password.length < 6) {
        alert("Password must be at least six characters long");
        return;
      } else if (password !== passwordConfirm) {
        alert("Password does not match the confirm password");
        return;
      }
      userAuth = { password };
    }

    const locationMerge = [userMetadata.locationAdmLevel2, userMetadata.locationAdmLevel1]
      .filter((item) => item)
      .join(', ')
      .concat(', ' + userMetadata.countryName);

    userMetadata.locationMerge = locationMerge;
    photographer.location = {
      country: userMetadata.country,
      countryName: userMetadata.countryName,
      locationAdmLevel1: userMetadata.locationAdmLevel1,
      locationAdmLevel2: userMetadata.locationAdmLevel2,
      locationMerge: userMetadata.locationMerge
    };

    if (this.isEditMode()) {
      userMetadata = this.checkIfUserStatusChange();
      this.props.onSubmit(userMetadata, photographer, userAuth);
    } else {
      // create new data

      this.setState({submittingNewUser: true});
      axios
      .post(API_SERVICE_URL + "users", {
        ...userMetadata,
        ...photographer,
        password: userAuth.password,
        userType: USER_TYPE.PHOTOGRAPHER
      })
      .then((response) => {
        Swal('Success!', response.data.message, 'success');
        this.setState({submittingNewUser: false}, () => {
          this.props.history.push('/users/' + USER_TYPE.PHOTOGRAPHER + "/" + response.data.uid);
        });
      })
    }

  }

  checkIfUserStatusChange = () => {
    const { userMetadata, initialStatus } = this.state;
    if (Number(userMetadata.enable) !== Number(initialStatus)) {
      if (Number(userMetadata.enable) === 0) {
        userMetadata.blockedDate = moment().format("DD/MM/YYYY");
        this.setState({
          initialStatus: 0,
          displayBlockedReason: userMetadata.reason
        });
      } else {
        this.setState({
          initialStatus: 1,
          userMetadata: {
            ...userMetadata,
            reason: ''
          },
          displayBlockedReason: ''
        });
      }
    } else {
      this.setState({displayBlockedReason: userMetadata.reason});
    }
    return userMetadata;
  }

  handleBrowserPhotoProfile = (event) => {
    const fileObject = event.target.files[0];
    let fileReader = new FileReader();
    fileReader.readAsDataURL(fileObject);
    fileReader.onload = (evt) => {
      this.setState({
        newPhotoProfile: {
          ...this.state.newPhotoProfile,
          fileObject: fileObject,
          fileName: fileObject.name,
          preview: evt.target.result
        }
      });
    }
  }

  handleUploadPhotoProfile = () => {
    this.setState({uploadingPhotoProfile: true});

    const { userMetadata, newPhotoProfile } = this.state;

    let urlUploadRequest = process.env.REACT_APP_CLOUDINARY_API_BASE_URL;
    urlUploadRequest += '/image/upload';

    const nowDateTime = Date.now();
    let signature = `public_id=${userMetadata.uid}`;
    signature += `&timestamp=${nowDateTime}`;
    signature += `&upload_preset=${process.env.REACT_APP_CLOUDINARY_PHOTO_PROFILE_PRESET}`;
    signature += process.env.REACT_APP_CLOUDINARY_API_SECRET;

    const formData = new FormData();
      formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_PHOTO_PROFILE_PRESET);
      formData.append('public_id', userMetadata.uid);
      formData.append('timestamp', nowDateTime);
      formData.append('api_key', process.env.REACT_APP_CLOUDINARY_API_KEY);
      formData.append('signature', sha1(signature));
      formData.append('file', newPhotoProfile.fileObject);

      axios
        .post(urlUploadRequest, formData, {})
        .then((response) => {
          const userData = {
            photoURL: response.data.secure_url,
            publicID: response.data.public_id
          };

          axios
            .put(`${API_SERVICE_URL}auth/update/${userMetadata.uid}`, userData)
            .then(() => {
              this.inputPhotoProfile.value = "";

              this.setState({
                userMetadata: {
                  ...this.state.userMetadata,
                  photoProfileUrl: response.data.secure_url,
                },
                newPhotoProfile: {
                  fileObject: null,
                  fileName: '',
                  preview: null
                },
                uploadingPhotoProfile: false,
              }, () => {
                Swal('Success!', 'Photo profile uploaded successfully', 'success');
              });
            })
        })
        .catch((error) => {
          console.error(error);
        });
  }

  togglePassword = () => {
    this.setState({changePassword: !this.state.changePassword});
  }

  handleChangeCounterText = (event) => {
    let inputValue = event.target.value;

    if (event.target.name === 'selfDescription') {
      const len = inputValue.length
      const remaining = MAX_TEXT_LENGTH - len
      this.setState({
        aboutCharLeft: remaining,
      })
    }

    if (event.target.name === 'reason') {
      const len = event.target.value.length
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
    })

    const photographer = {
      ...this.state.photographer,
      languages: arrSelected,
    }

    this.setState({
      photographer: photographer,
    })
  }

  handleCountryChange = (selectedChoice) => {
    if (selectedChoice) {
      let { countriesData: {currencies} } = this.props;
      this.setState({
        userMetadata: {
          ...this.state.userMetadata,
          country: selectedChoice.value,
          countryName: selectedChoice.label,
          currency: currencies[selectedChoice.value],
          phoneDialCode: selectedChoice.phoneDialCode,
          locationAdmLevel1: '',
          locationAdmLevel2: '',
          locationMerge: '',
        },
        countryExt: {
          ...this.state.countryExt,
          continent: selectedChoice.continent
        },
      });
    }
  }

  getCities = (input) => {
    if (!input) {
      return Promise.resolve({ options: [] });
    }

    let urlApi = `${process.env.REACT_APP_API_HOSTNAME}/api/cities/`;
    urlApi += `?countryCode=${this.state.userMetadata.country}`;
    urlApi += `&continent=${this.state.countryExt.continent}`;
    urlApi += `&kwd=${input}`;

    return fetch(urlApi)
      .then(response => response.json())
      .then(results => {
        return results.data;
      });
  };

  handleCityChange = (selectedChoice) => {
    if (selectedChoice) {
      this.setState({
        userMetadata: {
          ...this.state.userMetadata,
          locationAdmLevel1: selectedChoice.adm1,
          locationAdmLevel2: selectedChoice.value
        }
      });
    }
  }

  getSelectValue = (value, options) => {
    return options.find(item => {
      return item.value === value;
    })
  }

  render() {
      let { countriesData: { countries } } = this.props;
      const { photographer, userMetadata, userAuth } = this.state;

      const city = userMetadata.locationAdmLevel2 ? 
        { value: userMetadata.locationAdmLevel2, label: userMetadata.locationAdmLevel2 }
        : null;

      return (
          <Row>
            <Col md={this.isEditMode() ? 7 : "9"}>
              <Form action="" className="form-horizontal px-3">
                {this.isEditMode() && (
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="id">ID</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input
                        type="text"
                        id="id"
                        name="id"
                        placeholder={userMetadata.uid}
                        disabled
                      />
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
                      value={userMetadata.displayName}
                      placeholder=""
                      onChange={this.handleChange}
                    />
                  </Col>
                </FormGroup>

                <FormGroup row>
                  <Col md="3">
                    <Label htmlFor="email">e-Mail</Label>
                  </Col>
                  <Col xs="12" md="9">
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={userMetadata.email}
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
                      value={this.getSelectValue(userMetadata.country, countries)}
                      options={countries}
                      clearable={false}
                      onChange={this.handleCountryChange}
                    />
                  </Col>
                </FormGroup>

                <FormGroup row>
                  <Col md="3">
                    <Label htmlFor="locationMerge">City</Label>
                  </Col>
                  <Col xs="12" md="9">
                    <AsyncSelect
                      multi={false}
                      cacheOptions
                      value={city}
                      onChange={this.handleCityChange}
                      valueKey="value"
                      labelKey="label"
                      loadOptions={this.getCities}
                      placeholder={userMetadata.country ? "Search and choose your city" : "Please select a country first"}
                      isDisabled={!userMetadata.country}
                      filterOption={() => (true)}
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
                        {userMetadata.phoneDialCode || "-"}
                      </InputGroupAddon>
                      <Input
                        type="number"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={userMetadata.phoneNumber}
                        placeholder="Insert phone"
                        onChange={this.handleChange}
                      />
                    </InputGroup>
                  </Col>
                </FormGroup>

                <FormGroup row>
                  <Col md="3">
                    <Label htmlFor="selfDescription">About Photographer</Label>
                  </Col>
                  <Col xs="12" md="9">
                    <Input
                      type="textarea"
                      id="selfDescription"
                      name="selfDescription"
                      rows="5"
                      maxLength={MAX_TEXT_LENGTH}
                      value={photographer.selfDescription || ""}
                      placeholder="Max 5000 characters"
                      onChange={this.handleChangeCounterText}
                    />
                    <FormText className="help-block">Characters left: {this.state.aboutCharLeft} </FormText>
                  </Col>
                </FormGroup>

                <FormGroup row>
                  <Col md="3">
                    <Label htmlFor="language">Language</Label>
                  </Col>
                  <Col xs="12" md="9">
                    <CreatableSelect
                      id="languages"
                      value={
                        'languages' in photographer
                          ? photographer.languages.map(item => {
                              return { value: item, label: item }
                            })
                          : ''
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

                {this.isEditMode() && (
                  <React.Fragment>
                    <FormGroup row>
                      <Col md="3">
                        <Label htmlFor="passwordCheckbox">Password</Label>
                      </Col>
                      <Col xs="12" md="9">
                        <CustomInput type="checkbox" 
                          id="passwordCheckbox" 
                          label="Change password"
                          onClick={this.togglePassword}
                        />
                      </Col>
                    </FormGroup>
                  </React.Fragment>
                )}

                { (this.state.changePassword || !this.isEditMode()) && (
                  <React.Fragment>
                    <FormGroup row>
                      <Col md="3">{!this.isEditMode() && "Password"}</Col>
                      <Col xs="12" md="9">
                        <Input
                          type="password"
                          id="password"
                          name="password"
                          value={userAuth.password}
                          onChange={this.handleChange}
                          placeholder={(this.isEditMode() ? "New" : "") +" Password"}
                        />
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                    <Col md="3">{!this.isEditMode() && "Confirm Password"}</Col>
                      <Col xs="12" md="9">
                        <Input
                          type="password"
                          id="passwordConfirm"
                          name="passwordConfirm"
                          value={userAuth.passwordConfirm}
                          onChange={this.handleChange}
                          placeholder={(this.isEditMode() ? "New" : "") +" Password Confirmation"}
                        />
                      </Col>
                    </FormGroup>
                  </React.Fragment>
                )}

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
                          value={userMetadata.enable}
                          onChange={this.handleChange}>
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
                          {this.state.userMetadata.blockedDate}
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
                        value={userMetadata.reason || ""}
                        onChange={this.handleChangeCounterText}
                        placeholder="Max 5000 characters"
                      />
                      <FormText className="help-block">Characters left: {this.state.reasonBlockLength} </FormText>
                    </Col>
                  </FormGroup>
                )}
              </Form>
            </Col>

            {
              this.isEditMode() && (
                <Col md="5">
                  <Card>
                    <CardImg top width="100%" 
                      style={{maxHeight: 425}}
                      src={this.state.newPhotoProfile.preview || (userMetadata.photoProfileUrl || defaultUserPhoto)} 
                      alt={userMetadata.displayName || "User Default"}
                    />
                    <CardBody>
                    <FormGroup>
                      <Label for="exampleFile">Change Photo:</Label>
                      <Input 
                        ref={ref => this.inputPhotoProfile = ref}
                        onChange={this.handleBrowserPhotoProfile} 
                        type="file"
                        name=""
                      />
                    </FormGroup>
                    <Button 
                      color="primary"
                      disabled={this.state.uploadingPhotoProfile} 
                      onClick={this.handleUploadPhotoProfile}
                    >
                      {this.state.uploadingPhotoProfile ? "Uploading photo profile..." : "Upload"}
                    </Button>
                    </CardBody>
                  </Card>
                </Col>
              )
            }
            <ManageSaveButton
              onClick={this.handleSubmit}
              isSubmitting={this.props.isSubmitting || this.state.submittingNewUser}
            />
          </Row>
      );
  }
}

const mapsStateToProps = (store) => ({
  countriesData: selectCountries(store.commons.countries)
});

export default connect(mapsStateToProps)(withRouter(DetailsForm));