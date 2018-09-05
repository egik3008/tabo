import React, { Component } from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardImg,
  Col,
  Row,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Form,
  FormGroup,
  FormText,
  Label,
  Input,
  Button,
  Table,
} from 'reactstrap'
import { CountryDropdown } from 'react-country-region-selector'
import SelectCurrency from 'react-select-currency'
import axios from 'axios'
import classnames from 'classnames'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import CreatableSelect from 'react-select/lib/Creatable'
import GoogleMapReact from 'google-map-react'
import Swal from 'sweetalert2'
import BigCalendar from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import moment from 'moment'
import 'moment/locale/id'
import uuidv4 from 'uuid/v4'

import { USER_TYPE } from '../constants/user';
import PackageForm from './PhotographersManage/PackageForm'
import PhotographerDetailsForm from './PhotographersManage/PhotographerDetailsForm';
import PhotographerEquipmentForm from './PhotographersManage/EquipmentForm';
import PortofolioForm from './PhotographersManage/PortofolioForm';
import SendMessageForm from './commons/SendMessageForm';

const MAX_TEXT_LENGTH = 5000;

class UserDetail extends Component {
  constructor(props) {
    super(props)
    this.toggle = this.toggle.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.state = {
      activeTab: 'detail',
      user: {
        uid: '',
        displayName: '',
        email: '',
        country: '',
        phoneNumber: '',
        address: '',
        currency: '',
        language: '',
        enable: 0,
      },
      photographer: {
        cameraEquipment: {
          body: [],
          lens: [],
        },
        languages: [],
        location: {
          country: '',
          countryName: '',
          locationAdmLevel1: '',
          locationAdmLevel2: '',
          locationMerge: '',
        },
        meetingPoints: [],
        notAvailableDates: [],
        packagesPrice: [],
        photosPortofolio: [],
        selfDescription: '',
        serviceReviews: {
          impressions: [],
          rating: {
            label: '',
            value: 0,
          },
        },
        userMetadata: {
          uid: '',
          displayName: '',
          email: '',
          phoneDialCode: '',
          phoneNumber: '',
          countryName: '',
          locationMerge: '',
          enable: 1,
          reason: '',
        },
      },
      title: '',
      loading: false,
      reasonBlockLength: MAX_TEXT_LENGTH,
      aboutCharLeft: MAX_TEXT_LENGTH,
      countries: [],
      isUploading: false
    }
    BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment))
  }

  static defaultProps = {
    center: {
      lat: -2.548926,
      lng: 118.0148634,
    },
    zoom: 1,
  }

  componentWillMount() {
    if ('id' in this.props.match.params) {
      this.setState({
        title: this.props.match.params.type + ' Detail',
      })
      this.fetchCountries().then(() => {
        this.fetchUser(this.props.match.params.type, this.props.match.params.id);
      })
    } else {
      this.fetchCountries().then(() => {
        this.setState({
          title: 'Manage ' + this.props.match.params.type + " - Add New Data",
          loading: false
        })
      });
    }
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      })
    }
  }

  isPhotographers = () => {
    return (this.props.match.params.type === USER_TYPE.PHOTOGRAPHER);
  }

  isTraveller = () => {
    return (this.props.match.params.type === USER_TYPE.TRAVELLER);
  }

  handleOnAddPackagePrice = (packagePrice) => {
    this.setState((prevState) => {
      let { packagesPrice } = this.state.photographer;
      packagesPrice.push(packagePrice);
      return {
        photographer: {
          ...prevState.photographer,
          packagesPrice
        }
      };
    });
  }

  handleChange = event => {
    let inputValue, inputName;
    if (event.label) {
      inputName = "phoneDialCode";
      inputValue = event.value;
    } else {
      inputName = event.target.name;
      inputValue = event.target.value
    }

    if (this.isPhotographers()) {
      const nameArr = ['selfDescription']
      let updatedUser;

      if (inputName === 'selfDescription') {
        const len = inputValue.length
        const remaining = MAX_TEXT_LENGTH - len
        this.setState({
          aboutCharLeft: remaining,
        })
      }

      if (inputName === 'reason') {
        const len = event.target.value.length
        const remaining = MAX_TEXT_LENGTH - len
        this.setState({
          reasonBlockLength: remaining,
        })
      }

      if (nameArr.indexOf(inputName) !== -1) {
        updatedUser = {
          ...this.state.photographer,
          [inputName]: inputValue,
        }
      } else {
        const updatedUserMetadata = {
          ...this.state.photographer.userMetadata,
          [inputName]: inputValue,
        }

        updatedUser = this.state.photographer
        delete updatedUser['userMetadata']
        updatedUser['userMetadata'] = updatedUserMetadata
      }

      this.setState({
        photographer: updatedUser,
      })
    } 
    
    // handle change if the user is Traveller
    else {
      if (event.target.name === 'reason') {
        const len = event.target.value.length
        const remaining = MAX_TEXT_LENGTH - len
        this.setState({
          reasonBlockLength: remaining,
        })
      }

      const updatedUser = {
        ...this.state.user,
        [event.target.name]: event.target.value,
      }

      this.setState({
        user: updatedUser,
      })
    }
  }

  handleSubmit = event => {
    if (this.isTraveller()) {
      const { user } = this.state

      if (Number(user.enable) === 1) {
        user.reason = ''
        user.blocked = {}
      }

      axios.put(`${process.env.REACT_APP_API_HOSTNAME}/api/users/${user.uid}`, user).then(response => {
        Swal('Success!', response.data.message, 'success')
      })
    } 
    
    // if photographers
    else {
      const photographer = this.state.photographer;
      const userMetadata = photographer.userMetadata;
      const uid = photographer.userMetadata.uid

      if (uid !== '') {
        axios.put(`${process.env.REACT_APP_API_HOSTNAME}/api/users/${uid}`, photographer.userMetadata).then(() => {
          delete photographer['userMetadata']
          delete photographer['reservationHistory']

          axios.put(`${process.env.REACT_APP_API_HOSTNAME}/api/photographers/${uid}`, photographer).then(response => {
            photographer.userMetadata = userMetadata;
            Swal('Success!', this.state.isUploading ? "Uploading success.." : response.data.message, 'success');
            this.setState({
              photographer: photographer,
              isUploading: false
            })
          })
        })
      } else {
        axios.post(`${process.env.REACT_APP_API_HOSTNAME}/api/photographers`, photographer).then(response => {
          Swal('Success!', response.data.message, 'success')
        })
      }
    }
  }

  handleImagesUpload = (files) => {
    this.setState({isUploading: true})

    const fileOutOfSize = [];
    let uploads = [];
    let urlUploadRequest = process.env.REACT_APP_CLOUDINARY_API_BASE_URL;
    urlUploadRequest += '/image/upload';

    // console.log(urlUploadRequest);
    // return;

    let { photosPortofolio } = this.state.photographer;

    Object.keys(files).forEach((itemKey) => {
      // Current used images upload strategy
      const fileItemObject = files[itemKey];
      if (fileItemObject.size <= 10000000) {
        
        const formData = new FormData();
        formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_PHOTOS_PORTFOLIO_PRESET);
        formData.append('tags', `portfolio-${this.state.user.uid}`);
        formData.append('file', fileItemObject);

        uploads.push(
          axios
            .post(urlUploadRequest, formData)
            .then((response) => {
              const newItem = {
                id: uuidv4(),
                publicId: response.data.public_id,
                imageFormat: response.data.format,
                url: response.data.secure_url,
                width: response.data.width,
                height: response.data.height,
                sizebytes: response.data.bytes,
                theme: '-',
                defaultPicture: false
              };

              photosPortofolio.push(newItem);

            })
            .catch((error) => {
              console.error('Catch error: ', error);
            })
        );

        
      } else {
        fileOutOfSize.push(fileItemObject.name);
      }
    })

    Promise.all(uploads)
      .then(() => {
        this.setState({
          photographer: {
            ...this.state.photographer,
            photosPortofolio: photosPortofolio,
          }
        }, () => {
          this.handleSubmit(); 
        })
      })

  }

  fetchUser(type, id) {
    const url = type === USER_TYPE.TRAVELLER ? 'users' : 'photographers'
    axios.get(`${process.env.REACT_APP_API_HOSTNAME}/api/${url}/${id}`).then(response => {
      if (type === USER_TYPE.TRAVELLER)
        this.setState({
          user: response.data,
          loading: false,
        })
      else {
        this.setState({
          photographer: response.data,
          loading: false,
        })
      }

      const remaining =
        MAX_TEXT_LENGTH - ('reason' in response.data ? response.data.reason.length : 0)

      const aboutCharRemaining = this.state.aboutCharLeft - ('selfDescription' in response.data ? response.data.selfDescription.length : 0)
      this.setState({
        reasonBlockLength: remaining,
        aboutCharLeft: aboutCharRemaining
      })
    })
  }

  fetchCountries() {
    this.setState({
      loading: true,
    })

    return axios.get(`${process.env.REACT_APP_API_HOSTNAME}/api/countries`).then(response => {
      if (response.data) {
        this.setState({
          countries: response.data,
        })
      }
    })
  }

  filterCaseInsensitive = (filter, row) => {
    const id = filter.pivotId || filter.id
    if (row[id] !== null) {
      return row[id] !== undefined ? String(row[id].toLowerCase()).includes(filter.value.toLowerCase()) : true
    }
  }

  renderTraveler() {
    const historyColumns = [
      {
        Header: 'ID Reservation',
        accessor: 'reservationId',
      },
      {
        Header: 'ID Photographer',
        accessor: 'photographerId',
      },
      {
        Header: 'Date',
        accessor: 'created',
        Cell: row =>
          moment(row.value)
            .locale('id')
            .format('lll'),
      },
      {
        Header: 'Booking Date',
        accessor: 'startDateTime',
        Cell: row =>
          moment(row.value)
            .locale('id')
            .format('lll'),
      },
      {
        Header: 'Package',
        accessor: 'packageId',
        maxWidth: 80,
      },
      {
        Header: 'Service Fee',
        accessor: 'photographerFee',
        maxWidth: 100,
        Cell: row => 'Rp. ' + Number(row.value).toLocaleString('id'),
      },
      {
        Header: 'Status',
        accessor: 'status',
        maxWidth: 120,
      },
    ]

    return (
      <div>
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
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === 'history' })}
              onClick={() => {
                this.toggle('history')
              }}>
              History
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === 'messages' })}
              onClick={() => {
                this.toggle('messages')
              }}>
              Messages
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId="detail">
            <Form action="" className="form-horizontal px-3">
              <FormGroup row>
                <Col md="3">
                  <Label htmlFor="id">ID</Label>
                </Col>
                <Col xs="12" md="9">
                  <Input type="text" id="id" name="id" placeholder={this.state.user.uid} disabled />
                </Col>
              </FormGroup>

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
                  <CountryDropdown
                    id="country"
                    name="country"
                    classes="form-control"
                    value={'country' in this.state.user ? this.state.user.country : ''}
                    onChange={val => {
                      const updatedUser = {
                        ...this.state.user,
                        country: val,
                        countryName: val,
                      }

                      this.setState({
                        user: updatedUser,
                      })
                    }}
                  />
                </Col>
              </FormGroup>

              <FormGroup row>
                <Col md="3">
                  <Label htmlFor="phoneNumber">Phone</Label>
                </Col>
                <Col xs="12" md="9">
                  <Input
                    type="number"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={this.state.user.phoneNumber}
                    placeholder="Insert phone"
                    onChange={this.handleChange}
                  />
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
                    value={this.state.user.address ? this.state.user.address : ''}
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
                  <SelectCurrency
                    id="currency"
                    name="currency"
                    className="form-control"
                    value={'currency' in this.state.user ? this.state.user.currency : ''}
                    onChange={this.handleChange}
                  />
                </Col>
              </FormGroup>

              <FormGroup row>
                <Col md="3">
                  <Label htmlFor="language">Language</Label>
                </Col>
                <Col xs="12" md="9">
                  <CreatableSelect
                    value={
                      'languages' in this.state.user
                        ? this.state.user.languages.map(item => {
                            return { value: item, label: item }
                          })
                        : ''
                    }
                    onChange={selected => {
                      const arrSelected = selected.map(item => {
                        return item.value
                      })

                      const user = {
                        ...this.state.user,
                        languages: arrSelected,
                      }

                      this.setState({
                        user: user,
                      })
                    }}
                    allowCreate={true}
                    isMulti
                  />
                </Col>
              </FormGroup>

              <FormGroup row>
                <Col md="9">
                  <Row>
                    <Col md="4">
                      <Label htmlFor="enable">Status</Label>
                    </Col>
                    <Col xs="12" md="8">
                      <Input
                        type="select"
                        id="enable"
                        name="enable"
                        value={this.state.user.enable}
                        onChange={this.handleChange}>
                        <option value="1">Active</option>
                        <option value="0">Blocked</option>
                      </Input>
                    </Col>
                  </Row>
                </Col>
                <Col md="3">
                  {Number(this.state.user.enable) === 0 && (
                    <span>
                      <p>
                        <strong>
                          {moment('blocked' in this.state.user ? this.state.user.blocked : {})
                            .locale('id')
                            .format('lll')}
                        </strong>
                      </p>
                      <p>{'reason' in this.state.user ? this.state.user.reason : '-'}</p>
                    </span>
                  )}
                </Col>
              </FormGroup>

              {Number(this.state.user.enable) === 0 && (
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
                      onChange={this.handleChange}
                    />
                    <FormText className="help-block">Max. {this.state.reasonBlockLength} character</FormText>
                  </Col>
                </FormGroup>
              )}
            </Form>
          </TabPane>

          <TabPane tabId="history">
            <ReactTable
              className="-striped -hightlight"
              columns={historyColumns}
              sortable={true}
              defaultSorted={[
                {
                  id: 'startDateTime',
                  desc: true,
                },
              ]}
              defaultPageSize={10}
              data={this.state.user.reservationHistory}
              loading={this.state.loading}
            />
          </TabPane>

          <TabPane tabId="messages">
            <SendMessageForm />
          </TabPane>
        </TabContent>
      </div>
    )
  }


  handleCreateTableChange = name => (selected) => {
    const arrSelected = selected.map(item => {
      return item.value
    })

    const cameraEquipment = {
      ...this.state.photographer.cameraEquipment,
      [name]: arrSelected,
    }

    const photographer = {
      ...this.state.photographer,
      cameraEquipment: cameraEquipment,
    }

    this.setState({photographer})
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

  renderPhotographer() {
    const historyColumns = [
      {
        Header: 'Traveler ID',
        accessor: 'travellerId',
      },
      {
        Header: 'Traveler Name',
        accessor: 'uidMapping',
        Cell: row => {
          const keys = Object.keys(row.value)
          const photographerIndex = keys.indexOf(this.props.match.params.id)
          const travelerIndex = photographerIndex === 0 ? 1 : 0
          const travelerId = keys[travelerIndex]
          return <span>{row.value[travelerId].displayName}</span>
        },
      },
      {
        Header: 'Destination',
        accessor: 'destination',
        maxWidth: 180,
      },
      {
        Header: 'Email',
        accessor: 'uidMapping',
        Cell: row => {
          const keys = Object.keys(row.value)
          const photographerIndex = keys.indexOf(this.props.match.params.id)
          const travelerIndex = photographerIndex === 0 ? 1 : 0
          const travelerId = keys[travelerIndex]
          return <span>{row.value[travelerId].email}</span>
        },
      },
      {
        Header: 'Currency',
        maxWidth: 80,
      },
      {
        Header: 'Updated',
        accessor: 'created',
        Cell: row =>
          moment(row.value)
            .locale('id')
            .format('lll'),
      },
      {
        Header: 'Status',
        accessor: 'status',
        maxWidth: 80,
      },
    ]

    const greatPlaceStyle = {
      // initially any map object has left top corner at lat lng coordinates
      // it's on you to set object origin to 0,0 coordinates
      position: 'absolute',
      width: 70,
      height: 70,
      left: -70 / 2,
      top: -70 / 2,

      border: '5px solid #f44336',
      borderRadius: 30,
      backgroundColor: 'white',
      textAlign: 'center',
      color: '#3f51b5',
      fontSize: 11,
      fontWeight: 'bold',
      padding: 4,
      cursor: 'pointer',
    }

    return (
      <div>
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
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === 'equipment' })}
              onClick={() => {
                this.toggle('equipment')
              }}>
              Equipment
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === 'package' })}
              onClick={() => {
                this.toggle('package')
              }}>
              Package
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === 'meeting-point' })}
              onClick={() => {
                this.toggle('meeting-point')
              }}>
              Meeting Point
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === 'unavailable-time' })}
              onClick={() => {
                this.toggle('unavailable-time')
              }}>
              Unavailable Time
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === 'portfolio' })}
              onClick={() => {
                this.toggle('portfolio')
              }}>
              Portfolio
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === 'history' })}
              onClick={() => {
                this.toggle('history')
              }}>
              History
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === 'messages' })}
              onClick={() => {
                this.toggle('messages')
              }}>
              Messages
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId="detail">
              <PhotographerDetailsForm 
                photographer={this.state.photographer}
                onFieldChange={this.handleChange} 
                onLanguagesChange={this.handleLanguagesChange}
                countries={this.state.countries}
                onSubmit={this.handleSubmit}
              />
          </TabPane>

          <TabPane tabId="equipment">
            <PhotographerEquipmentForm
              photographer={this.state.photographer}
              handleChange={this.handleCreateTableChange}
              onSubmit={this.handleSubmit}
            />
          </TabPane>

          <TabPane tabId="package">
            <PackageForm
              packagesPrice={this.state.photographer.packagesPrice}
              onAddPackagePrice={this.handleOnAddPackagePrice}
            />
          </TabPane>

          <TabPane tabId="meeting-point">
            <div style={{ height: '100vh', width: '100%' }}>
              <GoogleMapReact defaultCenter={this.props.center} defaultZoom={this.props.zoom}>
                {'meetingPoints' in this.state.photographer
                  ? this.state.photographer.meetingPoints.map((p, i) => (
                      <div key={i} lat={p.lat} lng={p.long} style={greatPlaceStyle}>
                        {p.meetingPointName}
                      </div>
                    ))
                  : ''}
              </GoogleMapReact>
            </div>

            <Table responsive bordered className="mt-3">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Address</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {'meetingPoints' in this.state.photographer
                  ? this.state.photographer.meetingPoints.map((p, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{p.meetingPointName}</td>
                        <td>
                          <Button>Edit</Button>
                          <Button
                            color="danger"
                            onClick={() => {
                              const meetingPoints = this.state.photographer.meetingPoints
                              meetingPoints.splice(i, 1)

                              this.setState({
                                ...this.state.photographer,
                                meetingPoints: meetingPoints,
                              })
                            }}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  : ''}
              </tbody>
            </Table>
          </TabPane>

          <TabPane tabId="unavailable-time">
            <div style={{ height: '100vh', width: '100%' }}>
              <BigCalendar
                events={
                  'notAvailableDates' in this.state.photographer
                    ? this.state.photographer.notAvailableDates.map((item, i) => {
                        return {
                          id: i,
                          title: 'Unavailable',
                          allDay: true,
                          start: new Date(item),
                          end: new Date(item),
                        }
                      })
                    : []
                }
                defaultDate={new Date()}
                views={{ month: true }}
              />
            </div>
          </TabPane>

          <TabPane tabId="portfolio">
                <PortofolioForm
                  photographer={this.state.photographer}
                  onUploadPhotos={this.handleImagesUpload}
                  isUploading={this.state.isUploading}
                />
          </TabPane>

          <TabPane tabId="history">
            <ReactTable
              className="-striped -hightlight"
              columns={historyColumns}
              sortable={true}
              defaultSorted={[
                {
                  id: 'created',
                  desc: true,
                },
              ]}
              defaultPageSize={10}
              data={this.state.photographer.reservationHistory}
              loading={this.state.loading}
            />
          </TabPane>

          <TabPane tabId="messages">
            <SendMessageForm />
          </TabPane>
        </TabContent>
      </div>
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
                  <strong>{this.state.title}</strong>
                </h3>
              </CardHeader>
              <CardBody>
                {!this.state.loading ? (
                  this.isTraveller() ? (
                    this.renderTraveler()
                  ) : (
                    this.renderPhotographer()
                  )
                ) : (
                  <div className="row justify-content-center align-items-center" style={{ height: '100vh' }}>
                    <i className="fa fa-spinner fa-spin fa-5x fa-fw" />
                    <span className="sr-only">Loading...</span>
                  </div>
                )}
              </CardBody>
              {/* {this.state.activeTab !== 'history' && (
                <CardFooter>
                  <Button color="primary" onClick={this.handleSubmit}>
                    Save
                  </Button>
                </CardFooter>
              )} */}
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default UserDetail
