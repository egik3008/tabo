import React from 'react';
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
  Button
} from 'reactstrap';

import Select from 'react-select';
import CreatableSelect from 'react-select/lib/Creatable'
import moment from 'moment'
import defaultUserPhoto from '../../assets/img/avatar/user_default.png';
import ManageSaveButton from '../commons/ManageSaveButton';

const MAX_TEXT_LENGTH = 5000;
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
      countryName: '',
      locationMerge: '',
      photoProfileUrl: '',
      enable: 1,
      reason: '',
      blockedDate: null,
    },
    photographer: {
      selfDescription: '',
      languages: []
    },
    initialStatus: 1, // status user (active/blocked)
    displayBlockedReason: '',
    reasonBlockLength: MAX_TEXT_LENGTH,
    aboutCharLeft: MAX_TEXT_LENGTH,
    changePassword: false,
  } 

  componentDidMount() {
    const { photographer } = this.props;

    const remaining = this.state.reasonBlockLength - photographer.userMetadata.reason.length;

    const aboutCharRemaining = this.state.aboutCharLeft - photographer.selfDescription.length
    
    this.setState({
      userMetadata: {
        ...this.state.userMetadata,
        ...photographer.userMetadata
      },
      photographer: {
        selfDescription: photographer.selfDescription,
        languages: photographer.languages
      },
      initialStatus: photographer.userMetadata.enable,
      displayBlockedReason: photographer.userMetadata.reason,
      reasonBlockLength: remaining,
      aboutCharLeft: aboutCharRemaining
    })
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

    userMetadata = this.checkIfUserStatusChange();

    this.props.onSubmit(userMetadata, photographer, userAuth);

  }

  checkIfUserStatusChange = () => {
    const { userMetadata, initialStatus } = this.state;
    if (Number(userMetadata.enable) !== initialStatus) {
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

  handleUploadPhotoProfile = () => {
    
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

  render() {
      let { countries } = this.props;
      const { photographer, userMetadata, userAuth } = this.state;

      let phoneDialCode = countries.find(item => {
        return item.value === userMetadata.phoneDialCode
      }) || [];

      return (
          <Row>
            <Col md="7">
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
                      value={userMetadata.displayName || ""}
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
                      value={userMetadata.email || ""}
                      placeholder=""
                      onChange={this.handleChange}
                    />
                  </Col>
                </FormGroup>

                <FormGroup row>
                  <Col md="3">
                    <Label htmlFor="countryName">Country</Label>
                  </Col>
                  <Col xs="12" md="9">
                    <Select
                      name="countryName"
                      value={userMetadata.countryName || ""}
                      options={[]}
                      clearable={false}
                      onChange={this.handleChange}
                    />
                  </Col>
                </FormGroup>

                <FormGroup row>
                  <Col md="3">
                    <Label htmlFor="locationMerge">City</Label>
                  </Col>
                  <Col xs="12" md="9">
                    <Input
                      type="text"
                      id="locationMerge"
                      name="locationMerge"
                      value={userMetadata.locationMerge || ""}
                      placeholder="Insert address"
                      onChange={this.handleChange}
                    />
                  </Col>
                </FormGroup>

                <FormGroup row>
                  <Col md="3">
                    <Label htmlFor="phoneNumber">Dial Code</Label>
                  </Col>
                  <Col xs="12" md="9">
                    <Select
                      name="phoneDialCode"
                      options={countries}
                      clearable={false}
                      isSearchable={true}
                      value={phoneDialCode}
                      onChange={this.handleChange}
                    />
                  </Col>
                </FormGroup>

                <FormGroup row>
                  <Col md="3">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                  </Col>
                  <Col xs="12" md="9">
                    <Input
                      type="number"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={userMetadata.phoneNumber || ""}
                      placeholder="Insert phone"
                      onChange={this.handleChange}
                    />
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

            <Col md="5">
            <Card>
              <CardImg top width="100%" 
                style={{maxHeight: 425}}
                src={userMetadata.photoProfileUrl || defaultUserPhoto} 
                alt={userMetadata.displayName || "User Default"}
              />
              <CardBody>
              <FormGroup>
                <Label for="exampleFile">Change Photo:</Label>
                <Input type="file" name="file" id="exampleFile" />
              </FormGroup>
              <Button color="primary">
                Upload
              </Button>
              </CardBody>
            </Card>
            </Col>

            <ManageSaveButton
              onClick={this.handleSubmit}
              isSubmitting={this.props.isSubmitting}
            />
          </Row>
      );
  }
}

export default DetailsForm;

const LANGUAGES =  [
  "English",
  "Thai",
  "Vietnamese",
  "Tagalog",
  "Korean",
  "Japanese",
  "Mandarin",
  "Burmese",
  "Malay",
  "Bahasa Indonesia",
  "Spanish",
  "Portuguese",
  "Russian",
  "German",
  "French",
  "Italian",
  "Turkish",
  "Polish",
  "Ukrainian",
  "Romanian",
  "Dutch",
  "Croatian",
  "Hungarian",
  "Greek",
  "Czech",
  "Swedish",
  "Hindi",
  "Arabic",
  "Bengali",
  "Punjabi",
  "Tamil",
  "Urdu",
  "Gujarati",
  "Persian"
];