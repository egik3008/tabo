import React from 'react';
import Gallery from 'react-photo-gallery';
import Lightbox from 'react-images';
import Switch from "react-switch";
import SelectedImage from "./SelectedImage";

import {
    Card,
    CardBody,
    Col,
    Row,
    FormGroup,
    FormText,
    Label,
    Button,
} from 'reactstrap'
import ManageSaveButton from '../commons/ManageSaveButton';

class PortofolioForm extends React.Component {

    state = { 
        photos: [], 
        currentImage: 0, 
        checked: false, 
        selectAll: false, 
        filesUpload: null,
        isEmpty: false,
        selectedPhotos: 0
    }

    handleOnUpload = () => {
        this.props.onUploadPhotos(this.state.filesUpload);
    }
    
    handleDeletePhotos = () => {
        if (this.state.selectedPhotos > 0) {
            const deletedPhotos = this.state.photos.filter(photo => {
                return photo.selected;
            });
    
            this.props.onDeletePhotos(deletedPhotos);
        }
        else alert('No photos selected...')
    }

    componentDidMount() {
        const { photosPortofolio } = this.props.photographer;
        this.convertFormatToGallery(photosPortofolio);
    }

    componentWillReceiveProps(nextProps) {
        const newPhotosPortofolio = nextProps.photographer.photosPortofolio;
        const prevPhotosPortofolio = this.props.photographer.photosPortofolio;

        const lNew = newPhotosPortofolio ? newPhotosPortofolio.length : 0;
        const oNew = prevPhotosPortofolio ? prevPhotosPortofolio.length : 0;
        
        if ((lNew !== oNew) || this.props.isUploading) {
            this.convertFormatToGallery(newPhotosPortofolio);
        }
        
    }

    convertFormatToGallery = (photosPortofolio) => {
        let photos = [];
        if (photosPortofolio) {
            photosPortofolio.forEach(photo => {
                if (!photo.defaultPicture) {
                    let newFormat = {
                        src: photo.url, 
                        width: 3, 
                        height: 2,
                        publicid: photo.publicId,
                    }
                    photos.push(newFormat);
                }
            });
        }
        this.setState({ photos, isEmpty: photos.length <= 0 });
    }

    selectImagesHandler = (event) => {
        const filesUpload = event.target.files;
        this.setState({filesUpload});
    }

    openLightbox = (event, obj) => {
        this.setState({
            currentImage: obj.index,
            lightboxIsOpen: true,
        });
    }

    closeLightbox = () => {
        this.setState({
            currentImage: 0,
            lightboxIsOpen: false,
        });
    }

    gotoPrevious = () => {
        this.setState({
            currentImage: this.state.currentImage - 1,
        });
    }
    gotoNext = () =>  {
        this.setState({
            currentImage: this.state.currentImage + 1,
        });
    }

    selectPhoto = (event, obj) => {
        
        let { photos, selectedPhotos }  = this.state;

        photos[obj.index].selected = !photos[obj.index].selected;
        
        if (photos[obj.index].selected) selectedPhotos += 1    
        else selectedPhotos -= 1

        this.setState({ photos, selectedPhotos });
    }

    toggleSelect =() => {
        let photos = this.state.photos.map((photo, index) => {
          return { ...photo, selected: !this.state.selectAll };
        });
        this.setState({ photos: photos, selectAll: !this.state.selectAll });
      }

    handleSwitch = (checked) => {
        this.setState({ checked, selectAll: true }, () => this.toggleSelect());
    }


    render() {
        const photos = this.state.photos;

        return (
            <Row>
                <Col md="5" xs={12}>
                    <Gallery 
                        photos={photos} 
                        onClick={!this.state.checked ? 
                            this.openLightbox : this.selectPhoto
                        }
                        ImageComponent={SelectedImage}
                        columns={2} 
                    />
                    <Lightbox images={photos}
                        onClose={this.closeLightbox}
                        onClickPrev={this.gotoPrevious}
                        onClickNext={this.gotoNext}
                        currentImage={this.state.currentImage}
                        isOpen={this.state.lightboxIsOpen}
                    />
                </Col>

                <Col md={this.state.isEmpty ? 12:7} xs="12">
                    {!this.state.isEmpty && (
                        <Card>
                            <CardBody>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start'
                                }}>
                                    <Label style={{marginRight: 10}}>Switch to ON for Delete Photos Mode:</Label>
                                    <Switch
                                        onChange={this.handleSwitch}
                                        checked={this.state.checked}
                                        id="normal-switch"
                                        uncheckedIcon={false}
                                        onColor="#ff0000"
                                        offColor="#080"
                                    />
                                </div>
                                {this.state.checked && (
                                    <Button 
                                        color="warning"
                                        onClick={this.handleDeletePhotos} 
                                        disabled={this.props.isDeleting}
                                        style={{marginTop: 20}}
                                    >
                                        {this.props.isDeleting ? 'Deleting photos...' : 'Delete Selected Photos'}
                                    </Button>
                                )}
                            </CardBody>
                        </Card>
                    )}
                    
                    <Card>
                        <CardBody>
                        <FormGroup>
                            <Label for="exampleFile">Browse to Add Photo:</Label><br/>
                            <input type="file" 
                                name="files"
                                multiple 
                                accept="image/*"
                                onChange={this.selectImagesHandler}
                            />
                            <FormText color="muted">
                            Maximum 10 Photos
                            </FormText>
                        </FormGroup>
                        </CardBody>
                    </Card>
                </Col>

                <ManageSaveButton
                    onClick={this.handleOnUpload}
                    isSubmitting={this.props.isUploading}
                    disabled={!this.state.filesUpload}
                    isSubmittingLabel="Uploading..."
                />
            </Row>
            
        );
    }
}

export default PortofolioForm;