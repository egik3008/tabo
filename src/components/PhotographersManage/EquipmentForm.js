import React from 'react';
import CreatableSelect from 'react-select/lib/Creatable'

import {
    Col,
    FormGroup,
    Label,
    Button
  } from 'reactstrap'

class EquipmentForm extends React.Component {
    render() {
        let { photographer } = this.props;
        return (
            <div>
            <FormGroup row>
              <Col md="3">
                <Label htmlFor="body">Body</Label>
              </Col>
              <Col xs="12" md="9">
                <CreatableSelect
                  value={
                    'cameraEquipment' in photographer
                      ? 'body' in photographer.cameraEquipment
                        ? photographer.cameraEquipment.body.map(item => {
                            return { value: item, label: item }
                          })
                        : ''
                      : ''
                  }
                  onChange={this.props.handleChange('body')}
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
                  value={
                    'cameraEquipment' in photographer
                      ? 'lens' in photographer.cameraEquipment
                        ? photographer.cameraEquipment.lens.map(item => {
                            return { value: item, label: item }
                          })
                        : ''
                      : ''
                  }
                  onChange={this.props.handleChange('lens')}
                  allowCreate={true}
                  isMulti
                />
              </Col>
            </FormGroup>
            <Col md={12} xs={12}>
                <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                  <Button 
                    color="primary" 
                    onClick={this.props.onSubmit}
                    style={{marginTop: 20, width: 200}}
                  >
                    Save
                  </Button>
                </div>  
            </Col>
            </div>
        );
    }
}

export default EquipmentForm;