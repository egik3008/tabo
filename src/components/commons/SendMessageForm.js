import React from 'react';
import {
    Form,
    FormGroup,
    Label,
    Input,
    Button,
  } from 'reactstrap'

class SendMessageForm extends React.Component {
    render() {
        return (
            <Form className="p-3">
              <FormGroup row>
                <Label htmlFor="textarea-input">Messages :</Label>
                <Input type="textarea" name="textarea-input" id="textarea-input" rows="9" placeholder="Content..." />
              </FormGroup>

              <FormGroup row>
                <Button color="primary">Send</Button>
              </FormGroup>
            </Form>
        );
    }
 }

 export default SendMessageForm;