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
  Button
} from 'reactstrap';

import Select from 'react-select';
import CreatableSelect from 'react-select/lib/Creatable'
import moment from 'moment'
import defaultUserPhoto from '../../assets/img/avatar/user_default.png';
import ManageSaveButton from '../commons/ManageSaveButton';

const MAX_TEXT_LENGTH = 5000;
class PhotographerDetailsForm extends React.Component {

  state = {
    reasonBlockLength: MAX_TEXT_LENGTH,
    aboutCharLeft: MAX_TEXT_LENGTH,
  }

  componentDidMount() {
    const { photographer } = this.props;
    const remaining =
      MAX_TEXT_LENGTH - ('reason' in photographer ? photographer.reason.length : 0)

    const aboutCharRemaining = this.state.aboutCharLeft - ('selfDescription' in photographer ? photographer.selfDescription.length : 0)
    this.setState({
      reasonBlockLength: remaining,
      aboutCharLeft: aboutCharRemaining
    })
  }

  handleSubmit = () => {
    const { userMetadata } = this.props.photographer;
    if (
      (userMetadata.displayName && userMetadata.displayName !== "") && 
      (userMetadata.email && userMetadata.email !== "") 
    ) {
      this.props.onSubmit();
    } else {
      alert("Field Name & Email are mandatory");
    }
  }

  handleUploadPhotoProfile = () => {
    
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
    this.props.onFieldChange(event);
  }

  render() {
      let { photographer, countries } = this.props;
      let defaultDialCode = countries.find(item => {
        return item.value === photographer.userMetadata.phoneDialCode
      }) || [];

      return (
          <Row>
            <Col md="7">
              <Form action="" className="form-horizontal px-3">
                {photographer.userMetadata.uid !== '' && (
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="id">ID</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input
                        type="text"
                        id="id"
                        name="id"
                        placeholder={photographer.userMetadata.uid}
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
                      value={photographer.userMetadata.displayName}
                      placeholder=""
                      onChange={this.props.onFieldChange}
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
                      value={photographer.userMetadata.email}
                      placeholder=""
                      onChange={this.props.onFieldChange}
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
                      defaultValue={defaultDialCode}
                      options={countries}
                      clearable={false}
                      isSearchable={true}
                      onChange={this.props.onFieldChange}
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
                      value={photographer.userMetadata.phoneNumber}
                      placeholder="Insert phone"
                      onChange={this.props.onFieldChange}
                    />
                  </Col>
                </FormGroup>

                <FormGroup row>
                  <Col md="3">
                    <Label htmlFor="countryName">Country</Label>
                  </Col>
                  <Col xs="12" md="9">
                    <Input
                      type="text"
                      id="countryName"
                      name="countryName"
                      value={photographer.userMetadata.countryName}
                      placeholder="Insert country"
                      onChange={this.props.onFieldChange}
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
                      value={photographer.userMetadata.locationMerge}
                      placeholder="Insert address"
                      onChange={this.props.onFieldChange}
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
                      value={photographer.selfDescription}
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
                      onChange={this.props.onLanguagesChange}
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
                          value={photographer.userMetadata.enable}
                          onChange={this.props.onFieldChange}>
                          <option value="1">Active</option>
                          <option value="0">Blocked</option>
                        </Input>
                      </Col>
                    </Row>
                  </Col>
                  <Col>
                    {Number(photographer.userMetadata.enable) === 0 && (
                      <span>
                        <strong>
                          {moment(
                            'blockedDate' in photographer.userMetadata
                              ? photographer.userMetadata.blockedDate
                              : {}
                          )
                            .locale('id')
                            .format('lll')}
                        </strong>
                      </span>
                    )}
                  </Col>
                </FormGroup>

                {Number(photographer.userMetadata.enable) === 0 && (
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
                        value={photographer.userMetadata.reason}
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
                src={photographer.userMetadata.photoProfileUrl || defaultUserPhoto} 
                alt={photographer.userMetadata.displayName || "User Default"}
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

export default PhotographerDetailsForm;