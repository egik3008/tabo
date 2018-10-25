import React, { Component } from 'react';
import cloudinary from 'cloudinary-core';
import { withRouter, Link } from 'react-router-dom';
import uuidv4 from 'uuid/v4';
import firebase from 'firebase';
import Swal from 'sweetalert2';
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
  Button,
  Progress
} from 'reactstrap';
import classnames from 'classnames'
import moment from 'moment';
import 'moment/locale/id';

import LoadingAnimation from '../commons/LoadingAnimation';
import ManageSaveButton from '../commons/ManageSaveButton';

class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'detail',
      photoAlbum: {
        id: '',
        albums: [],
        photographer: '',
        traveller: '',
        created: '',
        downloadLink: '',
      },
      imagesAddedBuffer: [],
      imagesExistingDeleted: [],
      uploadedImagesList: [],
      isUploading: false,
      loading: false,
    }

    this.cloudinaryInstance = cloudinary.Cloudinary.new({
      cloud_name: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
      secure: true
    });
  }

  componentWillMount() {
    this.fetchPhotoAlbum(this.props.match.params.id);
  }

  componentWillUnmount() {
    this.cloudinaryInstance = null;
  }

  toggle = (tab) => {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      })
    }
  }

  hasPhotos = () => {
    const { imagesAddedBuffer, photoAlbum: {albums} } = this.state;
    return (imagesAddedBuffer.length > 0) || (albums.length > 0);
  }

  handleRemoveFromUploadBuffer = (event, indexPM1) => {
    event.preventDefault();
    const newImages = this.state.imagesAddedBuffer.filter((item, indexPM2) => indexPM1 !== indexPM2);
    this.setState({ imagesAddedBuffer: newImages });
  };

  handleRemoveFromStorage = (event, imageId) => {
    event.preventDefault();
    const { photoAlbum: {albums}, imagesExistingDeleted } = this.state;
    const newImages = albums.filter((item) => imageId !== item.id);
    const deletedFile = albums.filter((item) => imageId === item.id)[0];
    imagesExistingDeleted.push(deletedFile);

    this.setState({
      photoAlbum: {
        ...this.state.photoAlbum,
        albums: newImages,
      },
      imagesExistingDeleted
    });
  };

  isAlbumDelivered = () => {
    return this.state.reservation.albumDelivered === 'Y';
  }

  fetchPhotoAlbum(id) {
    this.setState({
      loading: true,
    });

    const db = firebase.database();
    db.ref('albums').child(id).once('value')
      .then(snap => {
        db.ref('reservations').child(id).once('value')
          .then(snapRes => {
              const rsrv = snapRes.val();
              const photographer = rsrv.uidMapping[rsrv.photographerId].displayName;
              const traveller = rsrv.uidMapping[rsrv.travellerId].displayName;
              this.setState({
                photoAlbum: {
                  ...this.state.photoAlbum,
                  albums: snap.val(),
                  photographer,
                  traveller,
                  id
                },
                loading: false
              })
          });
      });
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

  displayPriceFormat = (price, currency) => {
    currency = currency || "IDR";
    const local = currency === "IDR" ? "id" : 'us';
    return `${currency} ${Number(price).toLocaleString(local)}`;
  }

  render() {
    const {photoAlbum: {albums}, imagesAddedBuffer} = this.state;

    const renderDetail = (
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
            <div className="reservation-detail-header">
              <dl className="row mb-2">
                <dt className="col-sm-3">Photo Album ID</dt>
                <dd className="col-sm-9">: {this.state.photoAlbum.id}</dd>
                <dt className="col-sm-3">Reservation ID</dt>
                <dd className="col-sm-9">:&nbsp;
                  {
                    <Link to={"/reservations/" + this.state.photoAlbum.id}>
                      {this.state.photoAlbum.id}
                    </Link>
                  }
                </dd>
              </dl>
              <dl className="row mb-2 reservation-detail-content">
                  <dt className="col-sm-3">Photographer</dt>
                  <dd className="col-sm-9">: {this.state.photoAlbum.photographer}</dd>

                  <dt className="col-sm-3">Traveller</dt>
                  <dd className="col-sm-9">: {this.state.photoAlbum.traveller}</dd>

                  <dt className="col-sm-3">Created</dt>
                  <dd className="col-sm-9">: {this.state.photoAlbum.created}</dd>

                  <dt className="col-sm-3">Number of Photos</dt>
                  <dd className="col-sm-9">: {this.state.photoAlbum.albums.length}</dd>

                  <dt className="col-sm-3">Download Link</dt>
                  <dd className="col-sm-9">: {this.state.photoAlbum.downloadLink}</dd>
              </dl>
            </div>

            <Row>

                <Col md={this.hasPhotos() ? 5:12} xs="12">
                    <Card>
                        <CardBody className="portfolio-left-container">
                            {
                                !this.hasPhotos() && (
                                    <p>Photo Album is empty.</p>
                                )
                            }
                            <input type="file" 
                                name="files"
                                multiple 
                                accept="image/*"
                                ref={ref => (this._uploadFile = ref)}
                                style={{display: "none"}}
                                onChange={this.selectImagesHandler}
                            />
                            <Button
                                color="success" 
                                size="lg"
                                onClick={() => this._uploadFile.click()}
                            >
                                Browse to add Photo
                            </Button>
                            Maximum 30 Photos
                        </CardBody>
                    </Card>
                </Col>

                <Col md={this.hasPhotos() ? 7 : 12} xs={12}>
                  <Row>
                  <div id="photo-preview">
                  {
                    albums.length > 0 && albums.map((photo, key) => (
                      <div key={key}>
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.25)',
                          }}
                        />

                        <img
                          src={this.cloudinaryInstance.url(photo.publicId, { width: 320, crop: 'scale' })}
                          alt="This is the alt text"
                        />

                        <i
                          title="Remove Photo"
                          onClick={event => this.handleRemoveFromStorage(event, photo.id)}
                        />
                      </div>
                    ))
                  }


                  {
                    imagesAddedBuffer.length > 0 && imagesAddedBuffer.map((photo, key) => (
                      <div key={key}>
                        {
                          photo.hasOwnProperty('percentCompleted') && photo.percentCompleted === 100
                            ? (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  background: "url('/images/done.png') no-repeat center center rgba(255,255,255,0.5)"
                                }}
                              />
                            )
                            : null
                        }

                        {
                          photo.hasOwnProperty('percentCompleted') && photo.percentCompleted < 100
                            ? (
                              <Progress 
                                value={photo.percentCompleted}
                                color="info"
                                style={{
                                  position: 'absolute',
                                  top: 70,
                                  width: '100%',
                                }}
                              >
                                {`${photo.percentCompleted}%`}
                              </Progress>
                            )
                            : null
                        }

                        <img 
                          style={{width: '100%'}} 
                          src={photo.imagePreview} 
                          alt="This is the alt text"
                      />

                        {
                          !photo.hasOwnProperty('percentCompleted')
                            ? (
                              <i
                                title="Remove Photo"
                                onClick={event => this.handleRemoveFromUploadBuffer(event, key)}
                              />
                            )
                            : null
                        }
                      </div>
                    ))
                  }
                  </div>
                  </Row>
                </Col>

                <ManageSaveButton
                    onClick={this.submitImagesHandler}
                    isSubmitting={this.state.isUploading || this.props.isSubmitting}
                    disabled={this.state.isUploading || this.props.isSubmitting}
                    isSubmittingLabel="Updating portfolio..."
                />
            </Row>
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
                  <strong>Photo Album Detail</strong>
                </h3>
              </CardHeader>
              <CardBody>
                { this.state.loading ? <LoadingAnimation /> : renderDetail}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default withRouter(Detail);
