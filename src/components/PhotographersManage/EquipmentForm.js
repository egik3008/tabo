import React from 'react';
import CreatableSelect from 'react-select/lib/Creatable'

import {
    Col,
    FormGroup,
    Label
  } from 'reactstrap';

  import SaveButton from '../commons/ManageSaveButton';

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
            <SaveButton
              onClick={this.props.onSubmit}
              isSubmitting={this.props.isSubmitting}
            />
            </div>
        );
    }
}

export default EquipmentForm;