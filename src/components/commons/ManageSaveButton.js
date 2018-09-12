import React from 'react';
import {
    Col,
    Button
} from 'reactstrap';

class ManageSaveButton extends React.Component {
    render() {
        return (
            <Col md={12} xs={12}>
                <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                  <Button 
                    color="primary" 
                    onClick={this.props.onClick}
                    style={{marginTop: 20, width: 200}}
                    disabled={this.props.isSubmitting || this.props.disabled}
                  >
                    { this.props.isSubmitting ? (this.props.isSubmittingLabel || 'Submitting...') : (this.props.label || 'Save') }
                  </Button>
                </div>  
            </Col>
        );
    }
}

export default ManageSaveButton;