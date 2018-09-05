import React from 'react';
import Gallery from 'react-photo-gallery';
import Lightbox from 'react-images';
import Switch from "react-switch";
import SelectedImage from "./SelectedImage";

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

    convertFormatToGallery = (photosPortofolio, defaultPhotos=null) => {
        if (photosPortofolio) {
            let photos = photosPortofolio.map(photo => {
                let newFormat = {
                    src: photo.url, width: 3, height: 2
                }

                if (defaultPhotos && (defaultPhotos.length > 0)) {
                    const def = defaultPhotos.find((item) => {
                        return item.src === newFormat.src
                    });
                    if (def) {
                        newFormat = {
                            ...def,
                            ...newFormat
                        }
                    }
                }

                return newFormat; 
            });

            return photos;
        }
    }

    selectImagesHandler = (event) => {
        const filesUpload = event.target.files;
        this.setState({filesUpload});
    }

    handleDeletePhotos = () => {
        if (this.state.selectedPhotos > 0) alert('Coming soon...')
        else alert('No photos selected...')
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

        photos = this.convertFormatToGallery(this.props.photographer.photosPortofolio, photos);

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
        const photos = this.convertFormatToGallery(this.props.photographer.photosPortofolio) || [];

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
                                    alignItems: 'center'
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
                                    {this.state.checked && (
                                        <div style={{paddingLeft: 10}}>
                                            <Button 
                                                color="warning"
                                                onClick={this.handleDeletePhotos} 
                                            >
                                                Delete Selected Photos
                                            </Button>
                                        </div>
                                    )}
                                </div>
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

                <Col md={12} xs={12}>
                    <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                    <Button 
                        color="primary" 
                        onClick={() => this.props.onUploadPhotos(this.state.filesUpload)}
                        style={{marginTop: 40, width: 200}}
                        disabled={this.props.isUploading || !this.state.filesUpload}
                    >
                        {this.props.isUploading ? 'Uploading...' : 'Save'}
                    </Button>
                    </div>  
                </Col>
            </Row>
            
        );
    }
}

export default PortofolioForm;