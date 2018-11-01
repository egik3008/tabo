import React, { Component } from 'react';
import cloudinary from 'cloudinary-core';
import { withRouter, Link } from 'react-router-dom';
import axios from 'axios';
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
import { displayDateFormat } from '../../utils/commonUtils';

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
                  created: rsrv.albumUpdated || rsrv.updated || rsrv.created,
                  packageId: rsrv.packageId,
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

  selectImagesHandler = (evt) => {
    const files = evt.target.files;
    const fileOutOfSize = [];

    Object.keys(files).forEach((itemKey) => {
      const fileItemObject = files[itemKey];
      if (fileItemObject.size <= 10000000) {
        const fileReader = new FileReader();

        fileReader.onloadend = (evtObj) => {
          const imageItem = {imagePreview: evtObj.target.result, fileObject: fileItemObject};
          this.setState({imagesAddedBuffer: [...this.state.imagesAddedBuffer, imageItem]});
        };
        fileReader.readAsDataURL(fileItemObject);

      } else {
        fileOutOfSize.push(fileItemObject.name);
      }
    });

    if (fileOutOfSize.length > 0) {
      const filesStr = fileOutOfSize.join("\n");
      alert("Some photos will not be uploaded. Because there are one or more photos have more than 10MB size\n---------------------------------\n" + filesStr);
    }
  };

  submitImagesHandler = async (evt) => {
    evt.preventDefault();
    this.setState({ isUploading: true });

    let urlUploadRequest = process.env.REACT_APP_CLOUDINARY_API_BASE_URL;
    urlUploadRequest += '/image/upload';

    if (this.state.imagesAddedBuffer.length > 0) {
      let uploads = [];
      const images = this.state.imagesAddedBuffer;

      images.forEach((item, index) => {
        const formData = new FormData();
        formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_ALBUMS_PRESET);
        formData.append('tags', `album-${this.state.photoAlbum.id}`);
        formData.append('file', item.fileObject);

        const uploadConfig = {
          onUploadProgress: (progressEvent) => {
            images[index].percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
            this.setState({ imagesAddedBuffer: images });
          }
        };

        uploads.push(
          axios
            .post(urlUploadRequest, formData, uploadConfig)
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

              this.setState({ uploadedImagesList: [ ...this.state.uploadedImagesList, newItem ] });
            })
            .catch((error) => {
              console.error('Catch error: ', error);
            })
        );
      });

      // // if any images existed deleted, run it first
      // if (this.state.imagesExistingDeleted.length > 0) {
      //   await this.deletePhotoAlbums(
      //     uid,
      //     this.state.imagesExistingDeleted,
      //     this.state.imagesExisting
      //   )
      // }

      if (images.length > 0) {
        if (uploads.length > 0) {
          Promise.all(uploads)
            .then(() => {
              const newImages = [
                ...this.state.photoAlbum.albums,
                ...this.state.uploadedImagesList
              ];

              this.saveUploadedImages(newImages);
            })
            .then(() => {
              this.successUploadedEvent();
            });
        }
      }

    } else if (this.state.imagesExistingDeleted.length > 0) {
      // await this.deletePortfolioPhotos(
      //   uid,
      //   this.state.imagesExistingDeleted,
      //   this.state.imagesExisting
      // )
      
      Swal('Success!', "Portofolio updated..", 'success');
      this.setState({ 
        imagesExistingDeleted: [], 
        isUploading: false 
      });

    } else {
      this.setState({ 
        isUploading: false 
      });
      Swal('', 'There are no images to be upload', 'info');
    }
  };

  saveUploadedImages(newImages) {
    const db = firebase.database();
    db
      .ref('reservations')
      .child(this.state.photoAlbum.id)
      .child('defaultAlbumPhotoPublicId')
      .once('value')
      .then((snapshot) => {
        db
          .ref('albums')
          .child(this.state.photoAlbum.id)
          .set(newImages)
          .then(() => {
            db
              .ref('reservations')
              .child(this.state.photoAlbum.id)
              .update({
                albumUpdated: firebase.database.ServerValue.TIMESTAMP,
                defaultAlbumPhotoPublicId: newImages[0].publicId 
              })
              .catch((error) => {
                console.log(error);
              });
          })
          .catch((error) => {
            console.log(error);
          });
      });
  }

  deletePhotoAlbums = (uid, photosDeleted, imagesExisting) => {
    if (photosDeleted.length > 0) {
      const publicIdList = photosDeleted.map((item) => item.publicId);

      return axios({
        method: 'DELETE',
        url: `${process.env.REACT_APP_API_HOSTNAME}/api/cloudinary-images/delete`,
        params: { public_ids: publicIdList }
      })
        .then(() => {
          return firebase
            .database()
            .ref('albums')
            .child(this.state.photoAlbum.id)
            .set({ photosPortofolio: imagesExisting });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  successUploadedEvent = () => {
    Swal('Success!', "Photo Albums updated..", 'success');
    let newImagesExisting = [
      ...this.state.photoAlbum.albums,
      ...this.state.uploadedImagesList
    ];

    if (this.state.photoAlbum.albums.length < 1) {
      newImagesExisting[0].defaultPicture = true;
    }

    this.setState({ 
      photoAlbum: {
        ...this.state.photoAlbum,
        created: new Date().getTime(),
        albums: newImagesExisting
      },
      uploadedImagesList: [],
      imagesAddedBuffer: [], 
      isUploading: false 
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
            <div className="tabo-detail-header" style={{marginBottom: 60}}>
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
              <dl className="row mb-2 tabo-detail-content">
                  <dt className="col-sm-3">Photographer</dt>
                  <dd className="col-sm-9">: {this.state.photoAlbum.photographer}</dd>

                  <dt className="col-sm-3">Traveller</dt>
                  <dd className="col-sm-9">: {this.state.photoAlbum.traveller}</dd>

                  <dt className="col-sm-3">Created/Last Deliverd</dt>
                  <dd className="tabo-content-semicolon">:</dd>
                  <dd className="col-sm-8 tabo-content-value">{displayDateFormat(this.state.photoAlbum.created)}</dd>

                  <dt className="col-sm-3">Number of Photos</dt>
                  <dd className="col-sm-9">: {this.state.photoAlbum.albums.length}</dd>

                  <dt className="col-sm-3">Download Link</dt>
                  <dd className="col-sm-9">: {this.state.photoAlbum.downloadLink}</dd>
              </dl>
            </div>

            <Row>
                <Col md={this.hasPhotos() ? 4:12} xs="12">
                    <Card style={{border: 'none'}}>
                        <CardBody className="photo-album-left-container">
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
                                style={{lineHeight: "2.5"}}
                                onClick={() => this._uploadFile.click()}
                            >
                                Browse to add Photo
                            </Button>
                            Minimum {packageMinimumPhotos[this.state.photoAlbum.packageId] || 0} Photos
                        </CardBody>
                    </Card>
                </Col>

                <Col md={this.hasPhotos() ? 8 : 12} xs={12} style={{marginBottom: 60}}>
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

const packageMinimumPhotos = {
  'PKG1': 30,
  'PKG2': 60,
  'PKG3': 120,
  'PKG4': 200,
}

export default withRouter(Detail);
