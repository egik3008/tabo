import React from 'react';
import CreatableSelect from 'react-select/lib/Creatable'

import {
    Col,
    FormGroup,
    Label
  } from 'reactstrap';

  import SaveButton from '../commons/ManageSaveButton';

class EquipmentForm extends React.Component {

  constructor(props) {
    super(props);

    const { cameraEquipment: {body, lens} } = props.photographer;

    this.state = {
      cameraEquipment: {
        body: body || [],
        lens: lens || []
      }
    }
  }

  handleChange = name => (selected) => {
    const arrSelected = selected.map(item => {
      return item.value
    });

    this.setState({
      cameraEquipment: {
        ...this.state.cameraEquipment,
        [name]: arrSelected,
      }
    })
  }

  handleSubmit = () => {
    this.props.onSubmit(this.state.cameraEquipment);
  }

  render() {
    const { cameraEquipment } = this.state;
      return (
          <div>
          <FormGroup row>
            <Col md="3">
              <Label htmlFor="body">Body</Label>
            </Col>
            <Col xs="12" md="9">
              <CreatableSelect
                value={
                  cameraEquipment.body.map(item => {
                    return { value: item, label: item }
                  })
                }
                onChange={this.handleChange('body')}
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
                  cameraEquipment.lens.map(item => {
                    return { value: item, label: item }
                  })
                }
                onChange={this.handleChange('lens')}
                allowCreate={true}
                isMulti
              />
            </Col>
          </FormGroup>

          <SaveButton
            onClick={this.handleSubmit}
            isSubmitting={this.props.isSubmitting}
          />
          </div>
      );
  }
}

export default EquipmentForm;