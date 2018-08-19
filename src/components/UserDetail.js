import React, { Component } from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
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
        phone: '',
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
      this.fetchUser(this.props.match.params.type, this.props.match.params.id)
    } else {
      this.setState({
        title: 'Add ' + this.props.match.params.type,
      })
    }
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      })
    }
  }

  handleChange = event => {
    if (this.props.match.params.type === 'photographer') {
      const nameArr = ['selfDescription']
      let updatedUser

      if (nameArr.indexOf(event.target.name) !== -1) {
        updatedUser = {
          ...this.state.photographer,
          [event.target.name]: event.target.value,
        }
      } else {
        const updatedUserMetadata = {
          ...this.state.photographer.userMetadata,
          [event.target.name]: event.target.value,
        }

        updatedUser = this.state.photographer
        delete updatedUser['userMetadata']
        updatedUser['userMetadata'] = updatedUserMetadata
      }

      this.setState(
        {
          photographer: updatedUser,
        },
        () => {
          return
        }
      )
    } else {
      const updatedUser = {
        ...this.state.user,
        [event.target.name]: event.target.value,
      }

      this.setState(
        {
          user: updatedUser,
        },
        () => {
          return
        }
      )
    }
  }

  handleSubmit = event => {
    event.preventDefault()

    if (this.props.match.params.type === 'traveler') {
      const { user } = this.state
      axios.put(`${process.env.REACT_APP_API_HOSTNAME}/api/users/${user.uid}`, user).then(response => {
        Swal('Success!', response.data.message, 'success')
      })
    } else {
      const { photographer } = this.state
      const uid = photographer.userMetadata.uid

      if (uid !== '') {
        axios.put(`${process.env.REACT_APP_API_HOSTNAME}/api/users/${uid}`, photographer.userMetadata).then(() => {
          delete photographer['userMetadata']
          delete photographer['reservationHistory']

          axios.put(`${process.env.REACT_APP_API_HOSTNAME}/api/photographers/${uid}`, photographer).then(response => {
            Swal('Success!', response.data.message, 'success')
          })
        })
      } else {
        axios.post(`${process.env.REACT_APP_API_HOSTNAME}/api/photographers`, photographer).then(response => {
          Swal('Success!', response.data.message, 'success')
        })
      }
    }
  }

  fetchUser(type, id) {
    this.setState({
      loading: true,
    })

    const url = type === 'traveler' ? 'users' : 'photographers'
    axios.get(`${process.env.REACT_APP_API_HOSTNAME}/api/${url}/${id}`).then(response => {
      if (type === 'traveler')
        this.setState({
          user: response.data.data,
          loading: false,
        })
      else {
        this.setState({
          photographer: response.data.data,
          loading: false,
        })
      }
    })
  }

  renderTraveler() {
    const historyColumns = [
      {
        Header: 'No.',
        maxWidth: 40,
        Cell: row => {
          return <span>{row.index + 1}</span>
        },
      },
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
      },
      {
        Header: 'Status',
        accessor: 'status',
        maxWidth: 80,
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
                  <Input
                    type="text"
                    id="country"
                    name="country"
                    value={this.state.user.country ? this.state.user.country : ''}
                    placeholder="Insert country"
                    onChange={this.handleChange}
                  />
                </Col>
              </FormGroup>

              <FormGroup row>
                <Col md="3">
                  <Label htmlFor="phoneNumber">Phone</Label>
                </Col>
                <Col xs="12" md="9">
                  <Input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={this.state.user.phoneNumber ? this.state.user.phoneNumber : ''}
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
                  <Input
                    type="text"
                    id="currency"
                    name="currency"
                    value={this.state.user.currency ? this.state.user.currency : ''}
                    placeholder="Insert currency"
                    onChange={this.handleChange}
                  />
                </Col>
              </FormGroup>

              <FormGroup row>
                <Col md="3">
                  <Label htmlFor="language">Language</Label>
                </Col>
                <Col xs="12" md="9">
                  <Input
                    type="text"
                    id="language"
                    name="language"
                    value={this.state.user.language ? this.state.user.language : ''}
                    placeholder="Insert language"
                    onChange={this.handleChange}
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
                      <strong>
                        {moment('updated' in this.state.user ? this.state.user.updated : 'now')
                          .locale('id')
                          .format('lll')}
                      </strong>
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
                      maxLength={420}
                      value={this.state.user.reason}
                      onChange={this.handleChange}
                    />
                    <FormText className="help-block">Max. 420 character</FormText>
                  </Col>
                </FormGroup>
              )}
            </Form>
          </TabPane>

          <TabPane tabId="history">
            <ReactTable
              className="-striped -hightlight"
              columns={historyColumns}
              manual
              sortable={false}
              data={this.state.user.reservationHistory}
              loading={this.state.loading}
            />
          </TabPane>

          <TabPane tabId="messages">
            <Form className="p-3">
              <FormGroup row>
                <Label htmlFor="textarea-input">Messages :</Label>
                <Input type="textarea" name="textarea-input" id="textarea-input" rows="9" placeholder="Content..." />
              </FormGroup>

              <FormGroup row>
                <Button color="primary">Send</Button>
              </FormGroup>
            </Form>
          </TabPane>
        </TabContent>
      </div>
    )
  }

  renderPhotographer() {
    const historyColumns = [
      {
        Header: 'No.',
        maxWidth: 40,
        Cell: row => {
          return <span>{row.index + 1}</span>
        },
      },
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
            <Row>
              <Col md="7">
                <Form action="" className="form-horizontal px-3">
                  {this.state.photographer.userMetadata.uid !== '' && (
                    <FormGroup row>
                      <Col md="3">
                        <Label htmlFor="id">ID</Label>
                      </Col>
                      <Col xs="12" md="9">
                        <Input
                          type="text"
                          id="id"
                          name="id"
                          placeholder={this.state.photographer.userMetadata.uid}
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
                        value={this.state.photographer.userMetadata.displayName}
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
                        value={this.state.photographer.userMetadata.email}
                        placeholder=""
                        onChange={this.handleChange}
                      />
                    </Col>
                  </FormGroup>

                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="phone">Phone</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input
                        type="text"
                        id="phone"
                        name="phone"
                        value={
                          this.state.photographer.userMetadata.phoneDialCode +
                          ' ' +
                          this.state.photographer.userMetadata.phoneNumber
                        }
                        placeholder="Insert phone"
                        onChange={this.handleChange}
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
                        value={this.state.photographer.userMetadata.countryName}
                        placeholder="Insert country"
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
                        value={this.state.photographer.userMetadata.locationMerge}
                        placeholder="Insert address"
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
                        value={this.state.photographer.selfDescription}
                        placeholder="5000 max char"
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
                        value={this.state.photographer.languages.map(item => {
                          return { value: item, label: item }
                        })}
                        onChange={selected => {
                          const arrSelected = selected.map(item => {
                            return item.value
                          })

                          const photographer = {
                            ...this.state.photographer,
                            languages: arrSelected,
                          }

                          this.setState(
                            {
                              photographer: photographer,
                            },
                            () => {
                              return
                            }
                          )
                        }}
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
                            value={this.state.photographer.userMetadata.enable}
                            onChange={this.handleChange}>
                            <option value="1">Active</option>
                            <option value="0">Blocked</option>
                          </Input>
                        </Col>
                      </Row>
                    </Col>
                    <Col>
                      {Number(this.state.photographer.userMetadata.enable) === 0 && (
                        <span>
                          <strong>
                            {moment(
                              'updated' in this.state.photographer.userMetadata
                                ? this.state.photographer.userMetadata.updated
                                : 'now'
                            )
                              .locale('id')
                              .format('lll')}
                          </strong>
                        </span>
                      )}
                    </Col>
                  </FormGroup>

                  {Number(this.state.photographer.userMetadata.enable) === 0 && (
                    <FormGroup row>
                      <Col md="3">
                        <Label htmlFor="reason">Reason</Label>
                      </Col>
                      <Col xs="12" md="9">
                        <Input
                          type="textarea"
                          id="reason"
                          name="reason"
                          maxLength={420}
                          value={this.state.photographer.userMetadata.reason}
                          onChange={this.handleChange}
                        />
                        <FormText className="help-block">Max. 420 character</FormText>
                      </Col>
                    </FormGroup>
                  )}
                </Form>
              </Col>

              <Col md="5">
                <img
                  src={this.state.photographer.userMetadata.photoProfileUrl}
                  alt={this.state.photographer.userMetadata.displayName}
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          </TabPane>

          <TabPane tabId="equipment">
            <FormGroup row>
              <Col md="3">
                <Label htmlFor="body">Body</Label>
              </Col>
              <Col xs="12" md="9">
                <CreatableSelect
                  value={this.state.photographer.cameraEquipment.body.map(item => {
                    return { value: item, label: item }
                  })}
                  onChange={selected => {
                    const arrSelected = selected.map(item => {
                      return item.value
                    })

                    const cameraEquipment = {
                      ...this.state.photographer.cameraEquipment,
                      body: arrSelected,
                    }

                    const photographer = {
                      ...this.state.photographer,
                      cameraEquipment: cameraEquipment,
                    }

                    this.setState(
                      {
                        photographer: photographer,
                      },
                      () => {
                        return
                      }
                    )
                  }}
                  allowCreate={true}
                  isMulti
                />
              </Col>
            </FormGroup>

            <FormGroup row>
              <Col md="3">
                <Label htmlFor="lens">Lens</Label>
              </Col>
              <Col xs="12" md="9">
                <CreatableSelect
                  value={this.state.photographer.cameraEquipment.lens.map(item => {
                    return { value: item, label: item }
                  })}
                  onChange={selected => {
                    const arrSelected = selected.map(item => {
                      return item.value
                    })

                    const cameraEquipment = {
                      ...this.state.photographer.cameraEquipment,
                      lens: arrSelected,
                    }

                    const photographer = {
                      ...this.state.photographer,
                      cameraEquipment: cameraEquipment,
                    }

                    this.setState(
                      {
                        photographer: photographer,
                      },
                      () => {
                        return
                      }
                    )
                  }}
                  allowCreate={true}
                  isMulti
                />
              </Col>
            </FormGroup>
          </TabPane>

          <TabPane tabId="package">
            <Table responsive bordered className="mt-3">
              <thead>
                <tr>
                  <th>Hour</th>
                  {/* <th>Photos</th> */}
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {this.state.photographer.packagesPrice.map((p, i) => (
                  <tr key={i}>
                    <td>{p.packageName}</td>
                    {/* <td>{p.requirement}</td> */}
                    <td>{p.priceIDR ? p.priceIDR.toLocaleString('id') : Number(p.price).toLocaleString('id')}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TabPane>

          <TabPane tabId="meeting-point">
            <div style={{ height: '100vh', width: '100%' }}>
              <GoogleMapReact defaultCenter={this.props.center} defaultZoom={this.props.zoom}>
                {this.state.photographer.meetingPoints.map((p, i) => (
                  <div key={i} lat={p.lat} lng={p.long} style={greatPlaceStyle}>
                    {p.meetingPointName}
                  </div>
                ))}
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
                {this.state.photographer.meetingPoints.map((p, i) => (
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
                ))}
              </tbody>
            </Table>
          </TabPane>

          <TabPane tabId="unavailable-time">
            <div style={{ height: '100vh', width: '100%' }}>
              <BigCalendar
                events={this.state.photographer.notAvailableDates.map((item, i) => {
                  return {
                    id: i,
                    title: 'Unavailable',
                    allDay: true,
                    start: new Date(item),
                    end: new Date(item),
                  }
                })}
                defaultDate={new Date()}
                views={{ month: true }}
              />
            </div>
          </TabPane>

          <TabPane tabId="portfolio">
            {this.state.photographer.photosPortofolio && this.state.photographer.photosPortofolio.length !== 0 ? (
              <Row>
                <Col md="7">
                  <Row className="no-gutters">
                    {this.state.photographer.photosPortofolio.map((item, i) => (
                      <Col md="4">
                        <img src={item.url} alt={'photo-' + i} style={{ width: '150px', height: '150px' }} />
                      </Col>
                    ))}
                  </Row>
                </Col>

                <Col md="5" />
              </Row>
            ) : (
              <span>
                <strong>No photos to show!</strong>
              </span>
            )}
          </TabPane>

          <TabPane tabId="history">
            <ReactTable
              className="-striped -hightlight"
              columns={historyColumns}
              manual
              sortable={false}
              data={this.state.photographer.reservationHistory}
              loading={this.state.loading}
            />
          </TabPane>

          <TabPane tabId="messages">
            <Form className="p-3">
              <FormGroup row>
                <Label htmlFor="textarea-input">Messages :</Label>
                <Input type="textarea" name="textarea-input" id="textarea-input" rows="9" placeholder="Content..." />
              </FormGroup>

              <FormGroup row>
                <Button color="primary">Send</Button>
              </FormGroup>
            </Form>
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
                {this.state.user.userType === 'traveller' ? this.renderTraveler() : this.renderPhotographer()}
              </CardBody>
              <CardFooter>
                <Button color="primary" onClick={this.handleSubmit}>
                  Save
                </Button>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default UserDetail
