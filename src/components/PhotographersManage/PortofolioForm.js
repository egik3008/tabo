import React from 'react';
import cloudinary from 'cloudinary-core';
import axios from 'axios';
import uuidv4 from 'uuid/v4';
import firebase from 'firebase';
import Swal from 'sweetalert2';
import {
    Card,
    CardBody,
    Col,
    Row,
    Button,
    Progress
} from 'reactstrap';

import database from '../../services/database';
import ManageSaveButton from '../commons/ManageSaveButton';

class PortofolioForm extends React.Component {
    constructor(props) {
      super(props);
      const { photosPortofolio } = props.photographer;

      this.state = {
        imagesExisting: photosPortofolio || [], 
        imagesAddedBuffer: [],
        imagesExistingDeleted: [],
        uploadedImagesList: [],
        isUploading: false,
      }

      this.cloudinaryInstance = cloudinary.Cloudinary.new({
        cloud_name: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
        secure: true
      });
    }

    componentWillUnmount() {
      this.cloudinaryInstance = null;
    }

    hasPortofolio = () => {
      const { imagesAddedBuffer, imagesExisting } = this.state;
      return (imagesAddedBuffer.length > 0) || (imagesExisting.length > 0);
    }

    selectImagesHandler = (event) => {
      const filesUpload = event.target.files;
      this.setState({filesUpload});
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

    handleRemoveFromUploadBuffer = (event, indexPM1) => {
      event.preventDefault();
      const newImages = this.state.imagesAddedBuffer.filter((item, indexPM2) => indexPM1 !== indexPM2);
      this.setState({ imagesAddedBuffer: newImages });
    };
  
    handleRemoveFromStorage = (event, imageId) => {
      event.preventDefault();
      const { imagesExisting, imagesExistingDeleted } = this.state;
      const newImages = imagesExisting.filter((item) => imageId !== item.id);
      const deletedFile = imagesExisting.filter((item) => imageId === item.id)[0];
      imagesExistingDeleted.push(deletedFile);

      this.setState({
        imagesExisting: newImages,
        imagesExistingDeleted
      });
    };

    updateUserMetadataDefaultDisplayPicture = (reference, pictureUrl, picturePublicId) => {
      const db = database.database();
      const ref = db.ref('/user_metadata');
      const userRef = ref.child(reference);

      return userRef.update({
        defaultDisplayPictureUrl: pictureUrl,
        defaultDisplayPicturePublicId: picturePublicId,
        updated: firebase.database.ServerValue.TIMESTAMP
      });
    }

    updatePhotographerServiceInfoPhotosPortofolio = (uid, data, isInitiation = true) => {
      if (data) {
        const db = database.database();
    
        if (isInitiation) {
          // Update defaultDisplayPictureUrl in user metadata
          return db
            .ref('user_metadata')
            .child(uid)
            .update({
              defaultDisplayPictureUrl: data[0].url,
              defaultDisplayPicturePublicId: data[0].publicId,
              updated: firebase.database.ServerValue.TIMESTAMP
            })
            .then(() => {
              // Update photos portofolio in photographer service information
              const photos = data.map((item, index) => index === 0
                ? { ...item, defaultPicture: true }
                : { ...item, defaultPicture: false });
    
              return db
                .ref('photographer_service_information')
                .child(uid)
                .update({
                  photosPortofolio: photos,
                  updated: firebase.database.ServerValue.TIMESTAMP
                });
            });
    
        } else {
          return db
            .ref('photographer_service_information')
            .child(uid)
            .update({
              photosPortofolio: data,
              updated: firebase.database.ServerValue.TIMESTAMP
            });
        }
      }
    }

    deletePortfolioPhotos = (uid, photosDeleted, imagesExisting) => {
      if (photosDeleted.length > 0) {
        const publicIdList = photosDeleted.map((item) => item.publicId);
  
        return axios({
          method: 'DELETE',
          url: `${process.env.REACT_APP_API_HOSTNAME}/api/cloudinary-images/delete`,
          params: {
            public_ids: publicIdList
          }
        })
          .then(() => {
            return database
              .database()
              .ref('photographer_service_information')
              .child(uid)
              .update({ photosPortofolio: imagesExisting });
          })
          .catch((error) => {
            console.error(error);
          });
      }
    };

    handleSetAsDefault = (event, pictureUrl, picturePublicId, imageId) => {
        event.preventDefault();
        const {
          userMetadata: { uid }
        } = this.props.photographer;
        const { imagesExisting } = this.state;
    
        this.updateUserMetadataDefaultDisplayPicture(uid, pictureUrl, picturePublicId);
        const newImages = imagesExisting.map((item) =>
          item.id === imageId
            ? { ...item, defaultPicture: true }
            : { ...item, defaultPicture: false }
        );
        this.setState({ imagesExisting: newImages });
        this.updatePhotographerServiceInfoPhotosPortofolio(uid, newImages, false);
    };

    submitImagesHandler = async (evt) => {
      evt.preventDefault();
      this.setState({ isUploading: true });

      const {userMetadata: {uid}} = this.props.photographer;
      let urlUploadRequest = process.env.REACT_APP_CLOUDINARY_API_BASE_URL;
      urlUploadRequest += '/image/upload';
  
      if (this.state.imagesAddedBuffer.length > 0) {
        let uploads = [];
        const images = this.state.imagesAddedBuffer;
  
        images.forEach((item, index) => {
          const formData = new FormData();
          formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_PHOTOS_PORTFOLIO_PRESET);
          formData.append('tags', `portfolio-${uid}`);
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

        // if any images existed deleted, run it first
        if (this.state.imagesExistingDeleted.length > 0) {
          await this.deletePortfolioPhotos(
            uid,
            this.state.imagesExistingDeleted,
            this.state.imagesExisting
          )
        }
  
        if (images.length > 0) {
          if (uploads.length > 0) {
            Promise.all(uploads)
              .then(() => {
                const newImages = [
                  ...this.state.imagesExisting,
                  ...this.state.uploadedImagesList
                ];
  
                const isInitPortfolios = this.state.imagesExisting.length < 1;
                this.updatePhotographerServiceInfoPhotosPortofolio(uid, newImages, isInitPortfolios);
              })
              .then(() => {
                this.successUploadedEvent();
              });
          }
        }
  
      } else if (this.state.imagesExistingDeleted.length > 0) {
        await this.deletePortfolioPhotos(
          uid,
          this.state.imagesExistingDeleted,
          this.state.imagesExisting
        )
        
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

    successUploadedEvent = () => {
      Swal('Success!', "Portofolio updated..", 'success');
      let newImagesExisting = [
        ...this.state.imagesExisting,
        ...this.state.uploadedImagesList
      ];

      if (this.state.imagesExisting.length < 1) {
        newImagesExisting[0].defaultPicture = true;
      }

      this.setState({ 
        imagesExisting: newImagesExisting,
        uploadedImagesList: [],
        imagesAddedBuffer: [], 
        isUploading: false 
      });
    }


    render() {
        const {imagesExisting, imagesAddedBuffer} = this.state;

        return (
            <Row>
                <Col md={this.hasPortofolio() ? 7 : 12} xs={12}>
                <Row>
                <div id="photo-preview">
                {
                  imagesExisting.length > 0 && imagesExisting.map((photo, key) => (
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

                      {
                        photo.defaultPicture
                          ? <span className="set-default-photo-profile-manager">Default photo</span>
                          : (
                            <a
                              className="set-default-photo-profile-manager"
                              title="Set this photo as default photo display"
                              data-
                              onClick={event => this.handleSetAsDefault(event, photo.url, photo.publicId, photo.id)}
                            >
                              Set as default
                            </a>
                          )
                      }
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

                <Col md={this.hasPortofolio() ? 5:12} xs="12">
                    <Card>
                        <CardBody className="portfolio-left-container">
                            {
                                !this.hasPortofolio() && (
                                    <p>The photographer hasn't portfolio yet.</p>
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
                            Maximum 10 Photos
                        </CardBody>
                    </Card>
                </Col>

                <ManageSaveButton
                    onClick={this.submitImagesHandler}
                    isSubmitting={this.state.isUploading || this.props.isSubmitting}
                    disabled={this.state.isUploading || this.props.isSubmitting}
                    isSubmittingLabel="Updating portfolio..."
                />
            </Row>
            
        );
    }
}

export default PortofolioForm;