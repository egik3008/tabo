import React, { Component } from 'react'
import ReactTable from 'react-table'
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
  Label,
  Input,
  Button,
} from 'reactstrap'
import axios from 'axios'
import classnames from 'classnames'
import moment from 'moment'
import 'moment/locale/id'
import 'react-table/react-table.css'

class UserDetail extends Component {
  constructor(props) {
    super(props)
    this.toggle = this.toggle.bind(this)
    this.state = {
      activeTab: 'detail',
      user: {},
      title: '',
      loading: false,
    }
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
      else
        this.setState({
          ...response,
          user: response.data.data.userMetadata,
          loading: false,
        })
    })
  }

  renderTraveler() {
    const columns = [
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
            <Form action="" method="post" className="form-horizontal">
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
                  <Label htmlFor="name">Name</Label>
                </Col>
                <Col xs="12" md="9">
                  <Input type="text" id="name" name="name" value={this.state.user.displayName} placeholder="" />
                </Col>
              </FormGroup>

              <FormGroup row>
                <Col md="3">
                  <Label htmlFor="email">Email</Label>
                </Col>
                <Col xs="12" md="9">
                  <Input type="email" id="email" name="email" value={this.state.user.email} placeholder="" />
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
                    value={this.state.user.phone ? this.state.user.phone : ''}
                    placeholder="Insert phone"
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
                  />
                </Col>
              </FormGroup>

              <FormGroup row>
                <Col md="3">
                  <Label htmlFor="status">Status</Label>
                </Col>
                <Col xs="12" md="9">
                  <Input type="select" id="status" name="status" value={this.state.user.enable}>
                    <option value="1">Active</option>
                    <option value="0">Blocked</option>
                  </Input>
                </Col>
              </FormGroup>
            </Form>
          </TabPane>

          <TabPane tabId="history">
            <ReactTable
              className="-striped -hightlight"
              columns={columns}
              manual
              sortable={false}
              data={this.state.user.reservationHistory}
              loading={this.state.loading}
            />
          </TabPane>

          <TabPane tabId="messages">this is messages</TabPane>
        </TabContent>
      </div>
    )
  }

  renderPhotographer() {
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
            <Form action="" method="post" className="form-horizontal">
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
                  <Label htmlFor="name">Name</Label>
                </Col>
                <Col xs="12" md="9">
                  <Input type="text" id="name" name="name" value={this.state.user.displayName} placeholder="" />
                </Col>
              </FormGroup>

              <FormGroup row>
                <Col md="3">
                  <Label htmlFor="email">Email</Label>
                </Col>
                <Col xs="12" md="9">
                  <Input type="email" id="email" name="email" value={this.state.user.email} placeholder="" />
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
                    value={this.state.user.phoneDialCode + ' ' + this.state.user.phoneNumber}
                    placeholder="Insert phone"
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
                    value={this.state.user.countryName}
                    placeholder="Insert country"
                  />
                </Col>
              </FormGroup>

              <FormGroup row>
                <Col md="3">
                  <Label htmlFor="address">City</Label>
                </Col>
                <Col xs="12" md="9">
                  <Input
                    type="text"
                    id="city"
                    name="city"
                    value={this.state.user.locationMerge}
                    placeholder="Insert address"
                  />
                </Col>
              </FormGroup>

              <FormGroup row>
                <Col md="3">
                  <Label htmlFor="about">About Photographer</Label>
                </Col>
                <Col xs="12" md="9">
                  <Input
                    type="textarea"
                    id="about"
                    name="about"
                    rows="5"
                    value={this.state.user.selfDescription}
                    placeholder="5000 max char"
                  />
                </Col>
              </FormGroup>

              <FormGroup row>
                <Col md="3">
                  <Label htmlFor="language">Language</Label>
                </Col>
                <Col xs="12" md="9">
                  <Input type="text" id="language" name="language" value="" placeholder="Insert language" />
                </Col>
              </FormGroup>

              <FormGroup row>
                <Col md="3">
                  <Label htmlFor="status">Status</Label>
                </Col>
                <Col xs="12" md="9">
                  <Input type="select" id="status" name="status" value={this.state.user.enable}>
                    <option value="1">Active</option>
                    <option value="0">Blocked</option>
                  </Input>
                </Col>
              </FormGroup>
            </Form>
          </TabPane>

          <TabPane tabId="equipment">this is equipment</TabPane>

          <TabPane tabId="package">this is package</TabPane>

          <TabPane tabId="meeting-point">this is meeting point</TabPane>

          <TabPane tabId="unavailable-time">this is unavailable time</TabPane>

          <TabPane tabId="portfolio">this is portfolio</TabPane>

          <TabPane tabId="history">this is history</TabPane>

          <TabPane tabId="messages">this is messages</TabPane>
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
              <CardHeader>{this.state.title}</CardHeader>
              <CardBody>
                {this.state.user.userType === 'traveller' ? this.renderTraveler() : this.renderPhotographer()}
              </CardBody>
              <CardFooter>
                <Button color="primary">Save</Button>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default UserDetail
