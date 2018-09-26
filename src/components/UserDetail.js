import React, { Component } from 'react';
import { connect } from 'react-redux';
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
import axios from 'axios';
import classnames from 'classnames';
import 'react-table/react-table.css';

import Swal from 'sweetalert2';
import uuidv4 from 'uuid/v4'
import qs from 'query-string';

import * as API from './../services/api';
import { USER_TYPE } from '../constants/user';
import PackageForm from './PhotographersManage/PackageForm'
import PhotographerDetailsForm from './PhotographersManage/DetailsForm';
import PhotographerEquipmentForm from './PhotographersManage/EquipmentForm';
import PortofolioForm from './PhotographersManage/PortofolioForm';
import MeetingPointForm from './PhotographersManage/MeetingPointForm';
import UnavailableTimeForm from './PhotographersManage/UnavailableTimeForm';
import ReservationHistory from './PhotographersManage/ReservationHistory';
import SendMessageForm from './commons/SendMessageForm';

import TravellerDetailsForm from './TravellerManage/DetailsForm';
import TravellerReservcationHistory from './TravellerManage/ReservationHistory';

import { fetchCountries } from '../store/actions/CommonAction';

const MAX_TEXT_LENGTH = 5000;
const API_SERVICE_URL = process.env.REACT_APP_API_HOSTNAME + "/api/";

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
      },
      loading: false,
      reasonBlockLength: MAX_TEXT_LENGTH,
      aboutCharLeft: MAX_TEXT_LENGTH,
      isSubmitting: false,
      addingPortofolio: false,
      deletingPortofolio: false
    }
    
  }

  componentDidMount() {
    this.setState({
      loading: true,
    });

    this.props.fetchCountries().then(() => {
      if (this.isEditMode()) {
        this.fetchUser(this.props.match.params.type, this.props.match.params.id);
      } else {
        this.setState({
          loading: false
        })
      }
    })
  }

  getTitle = () => {
    if (this.isEditMode()) {
      return this.props.match.params.type + ' Detail';
    } else {
      return 'Manage ' + this.props.match.params.type + " - Add New Data";
    }
  }

  fetchUser(type, id) {

    const url = (type === USER_TYPE.TRAVELLER) ? 'users' : 'photographers';

    axios.get(`${API_SERVICE_URL + url}/${id}`).then(response => {
      if (type === USER_TYPE.TRAVELLER)
        this.setState({
          user: response.data,
          loading: false,
        })
      else {
        this.setState({
          photographer: {
            ...this.state.photographer,
            ...response.data
          },
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

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      })
    }
  }

  filterCaseInsensitive = (filter, row) => {
    const id = filter.pivotId || filter.id
    if (row[id] !== null) {
      return row[id] !== undefined ? String(row[id].toLowerCase()).includes(filter.value.toLowerCase()) : true
    }
  }

  isEditMode = () => {
    return ('id' in this.props.match.params);
  }

  isPhotographers = () => {
    return (this.props.match.params.type === USER_TYPE.PHOTOGRAPHER);
  }

  isTraveller = () => {
    return (this.props.match.params.type === USER_TYPE.TRAVELLER);
  }

  updatePhotographerPortofolio = (newPortofolio, defaultPicture = false) => {
    const uid = this.state.photographer.userMetadata.uid;
    let newServiceInformation = {
      ...this.state.photographer,
      photosPortofolio: newPortofolio
    };
    delete newServiceInformation.userMetadata;

    API.updatePhotographerServiceInformation(uid, newServiceInformation)
      .then(() => {
        this.setState({
          photographer: {
            ...this.state.photographer,
            photosPortofolio: newPortofolio
          },
          addingPortofolio: false,
          deletingPortofolio: false
        })
        Swal('Success!', "Portofolio updated..", 'success');
      })
  }
  
  handleImagesUpload = (files, defaultPicture = false) => {
    this.setState({addingPortofolio: true})

    const fileOutOfSize = [];
    let uploads = [];
    let urlUploadRequest = process.env.REACT_APP_CLOUDINARY_API_BASE_URL;
    urlUploadRequest += '/image/upload';

    let newPortofolio = this.state.photographer.photosPortofolio;

    if (defaultPicture) {
      if (files.size <= 10000000) {
        
        const formData = new FormData();
        formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_PHOTOS_PORTFOLIO_PRESET);
        formData.append('tags', `portfolio-${this.state.user.uid}`);
        formData.append('file', files);

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
                defaultPicture: defaultPicture
              };

              newPortofolio.push(newItem);
            })
            .catch((error) => {
              console.error('Catch error: ', error);
            })
        );
      } else {
        fileOutOfSize.push(files.name);
      }
    } else {
      Object.keys(files).forEach((itemKey) => {
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
                defaultPicture: defaultPicture
              };

              newPortofolio.push(newItem);
            })
            .catch((error) => {
              console.error('Catch error: ', error);
            })
        );

        
      } else {
        fileOutOfSize.push(fileItemObject.name);
      }
    });
    }

    Promise.all(uploads)
      .then(() => {
        this.updatePhotographerPortofolio(newPortofolio, defaultPicture);
      })
  }

  handleDeletePhotos = (deletedPhotos) => {
    this.setState({deletingPortofolio: true});

    const photosRemaining = this.state.photographer.photosPortofolio.filter(photo => {
      const isDeleted = deletedPhotos.find(deletedPhoto => {
        return deletedPhoto.publicid === photo.publicId
      });
      return !isDeleted;
    })

    let paramsReq = [];

    deletedPhotos.forEach(item => {
      paramsReq.push(item.publicid);
    });

    axios
      .delete(API_SERVICE_URL + "cloudinary-images/delete", { 
        params: {
          public_ids: paramsReq
        },
        paramsSerializer: params => {
          return qs.stringify(params)
        }
      })
      .then((response) => {
        if (response.data.deleted) {
          this.updatePhotographerPortofolio(photosRemaining);
        }
      })
      .catch((error) => {
        console.error('Catch error: ', error);
      })
  }

  handleSubmitCameraEquipment = (cameraEquipment) => {
    this.setState({
      photographer: {
        ...this.state.photographer,
        cameraEquipment
      }
    }, () => {
      this.handleSubmit();
    })
  }

  handleSubmitPackagesPrice = (packagesPrice) => {
    this.setState({
      photographer: {
        ...this.state.photographer,
        packagesPrice
      }
    }, () => {
      this.handleSubmit();
    })
  }

  handleSubmitMeetingPoints = (meetingPoints) => {
    this.setState({
      photographer: {
        ...this.state.photographer,
        meetingPoints
      }
    }, () => {
      this.handleSubmit();
    })
  }

  handleSubmitUnavailableTime = (notAvailableDates) => {
    this.setState({
      photographer: {
        ...this.state.photographer,
        notAvailableDates
      }
    }, () => {
      this.handleSubmit();
    })
  }

  handleSubmitDetail = (userMetadata, photographer, userData) => {
    if (userData) {
      axios.put(`${API_SERVICE_URL}auth/update/${userMetadata.uid}`, userData);
    }

    if (this.isPhotographers()) {
      this.setState({
        photographer: {
          ...this.state.photographer,
          ...photographer,
          userMetadata: {
            ...this.state.photographer.userMetadata,
            ...userMetadata
          }
        }
      }, () => {
        this.handleSubmit();
      })
    } else {
      this.setState({
        user: {
          ...this.state.user,
          ...userMetadata
        }
      }, () => {
        this.handleSubmit();
      })
    }

  } 

  handleChange = event => {
    let inputValue, inputName;

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
    this.setState({isSubmitting: true});

    if (this.isTraveller()) {
      const { user } = this.state

      if (Number(user.enable) === 1) {
        user.reason = ''
        user.blocked = {}
      }

      axios.put(`${process.env.REACT_APP_API_HOSTNAME}/api/users/${user.uid}`, user).then(response => {
        Swal('Success!', response.data.message, 'success');
        this.setState({
          isSubmitting: false
        })
      })
    } 
    
    // if photographers
    else {
      const photographer = this.state.photographer;
      const userMetadata = photographer.userMetadata;
      const uid = photographer.userMetadata.uid

      if (uid !== '') {
        axios.put(`${API_SERVICE_URL}users/${uid}`, photographer.userMetadata)
        .then(() => {
          delete photographer['userMetadata']
          delete photographer['reservationHistory']

          axios.put(`${API_SERVICE_URL}photographers/${uid}`, photographer)
          .then(response => {
            photographer.userMetadata = userMetadata;
            Swal('Success!', response.data.message, 'success');
            
            this.setState({
              photographer: photographer,
              isSubmitting: false
            })
          })
        })
      } else {
        axios.post(`${API_SERVICE_URL}photographers`, photographer)
        .then(response => {
          Swal('Success!', response.data.message, 'success')
        })
      }
    }
  }

  renderTraveller() {
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
            <TravellerDetailsForm
              traveller={this.state.user}
              onSubmit={this.handleSubmitDetail}
              isSubmitting={this.state.isSubmitting}
            />
          </TabPane>

          <TabPane tabId="history">
            <TravellerReservcationHistory
              reservationHistory={this.state.user.reservationHistory}
            />
          </TabPane>

          <TabPane tabId="messages">
            <SendMessageForm />
          </TabPane>
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
              disabled={!this.isEditMode()}
              className={classnames({ active: this.state.activeTab === 'equipment' })}
              onClick={() => {
                this.toggle('equipment')
              }}>
              Equipment
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              disabled={!this.isEditMode()}
              className={classnames({ active: this.state.activeTab === 'package' })}
              onClick={() => {
                this.toggle('package')
              }}>
              Package
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              disabled={!this.isEditMode()}
              className={classnames({ active: this.state.activeTab === 'meeting-point' })}
              onClick={() => {
                this.toggle('meeting-point')
              }}>
              Meeting Point
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              disabled={!this.isEditMode()}
              className={classnames({ active: this.state.activeTab === 'unavailable-time' })}
              onClick={() => {
                this.toggle('unavailable-time')
              }}>
              Unavailable Time
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              disabled={!this.isEditMode()}
              className={classnames({ active: this.state.activeTab === 'portfolio' })}
              onClick={() => {
                this.toggle('portfolio')
              }}>
              Portfolio
            </NavLink>
          </NavItem>

          {
            this.isEditMode() && (
              <React.Fragment>
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
              </React.Fragment>
            )
          }
        </Nav>

        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId="detail">
              <PhotographerDetailsForm 
                photographer={this.state.photographer}
                onSubmit={this.handleSubmitDetail}
                isSubmitting={this.state.isSubmitting}
              />
          </TabPane>

          <TabPane tabId="equipment">
            <PhotographerEquipmentForm
              photographer={this.state.photographer}
              onSubmit={this.handleSubmitCameraEquipment}
              isSubmitting={this.state.isSubmitting}
            />
          </TabPane>

          <TabPane tabId="package">
            <PackageForm
              photographer={this.state.photographer}
              onSubmit={this.handleSubmitPackagesPrice}
              isSubmitting={this.state.isSubmitting}
            />
          </TabPane>

          <TabPane tabId="meeting-point">
            <MeetingPointForm
              photographer={this.state.photographer}
              onSubmit={this.handleSubmitMeetingPoints}
              isSubmitting={this.state.isSubmitting}
            />
          </TabPane>

          <TabPane tabId="unavailable-time">
              <UnavailableTimeForm
                photographer={this.state.photographer}
                onSubmit={this.handleSubmitUnavailableTime}
                isSubmitting={this.state.isSubmitting}
              />
          </TabPane>

          <TabPane tabId="portfolio">
                <PortofolioForm
                  photographer={this.state.photographer}
                  onUploadPhotos={this.handleImagesUpload}
                  isUploading={this.state.addingPortofolio}
                  isDeleting={this.state.deletingPortofolio}
                  onDeletePhotos={this.handleDeletePhotos}
                />
          </TabPane>

          {
            this.isEditMode() && (
              <React.Fragment>
                <TabPane tabId="history">
                <ReservationHistory
                  photographer={this.state.photographer}
                />
              </TabPane>

              <TabPane tabId="messages">
                <SendMessageForm />
              </TabPane>  
              </React.Fragment>
            )
          }
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
                  <strong>{this.getTitle()}</strong>
                </h3>
              </CardHeader>
              <CardBody>
                {!this.state.loading ? (
                  this.isTraveller() ? (
                    this.renderTraveller()
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
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default connect(null, {
  fetchCountries
})(UserDetail);
