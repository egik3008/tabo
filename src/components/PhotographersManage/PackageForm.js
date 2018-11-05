import React from 'react';
import firebase from 'firebase';
import Swal from 'sweetalert2';
import {
    Table,
    FormGroup,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Input,
} from 'reactstrap';
import ManageSaveButton from '../commons/ManageSaveButton';
import database from '../../services/database';


class PackageForm extends React.Component {
    state = {
        packagesPrice: [
            {id: "PKG1", packageName: "1 hour", price: 0},
            {id: "PKG2", packageName: "2 hour", price: 0},
            {id: "PKG3", packageName: "4 hour", price: 0},
            {id: "PKG4", packageName: "8 hour", price: 0},
        ],
        isSubmitting: false
    }

    handleChange = (event) => {
        const packageId = event.target.name;
        const newPrice = event.target.value;

        const newPackages = this.state.packagesPrice.map(pack => {
            if (pack.id === packageId) {
                pack.price = newPrice
            }
            return pack;
        });

        this.setState({
            packagesPrice: newPackages
        });
    }

    componentDidMount() {
        let { packagesPrice } = this.props.photographer;
        if (packagesPrice.length > 0) {
            this.setState({packagesPrice});
        }
    }

    handleSubmit = () => {
        this.setState({ isSubmitting: true });

        const {packagesPrice} = this.state;
        const db = database.database();
        const {uid} = this.props.photographer.userMetadata;
        db
            .ref('photographer_service_information')
            .child(uid)
            .update({
                packagesPrice,
                updated: firebase.database.ServerValue.TIMESTAMP
            })
            .then(() => {
                db
                .ref('user_metadata')
                .child(uid)
                .update({
                    priceStartFrom: packagesPrice[0].price,
                    updated: firebase.database.ServerValue.TIMESTAMP
                })
                .then(() => {
                    Swal('Success!', "Photographer package updated!", 'success');
                    this.setState({ isSubmitting: false });
                    this.props.updateParentState({
                        priceStartFrom: packagesPrice[0].price
                    });
                });
            })
            .catch(error => {
                console.error(error);
            });
    }

    render() {
        let { userMetadata } = this.props.photographer;
        
        return (
            <div style={styles.container}>
                <Table bordered className="col-md-4 mt-3">
                    <thead>
                        <tr>
                        <th style={{width: "40%"}}>Hour</th>
                        <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.packagesPrice.map((td) => (
                            <tr key={td.id}>
                                <td>{td.packageName}</td>
                                <td>
                                <FormGroup style={{marginBottom: 0}}>
                                    <InputGroup>
                                    <Input
                                        name={td.id}
                                        type="number"
                                        value={td.price}
                                        onChange={this.handleChange}
                                    />
                                    <InputGroupAddon addonType="append">
                                        <InputGroupText>
                                            {userMetadata.currency}
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    </InputGroup>
                                </FormGroup>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <ManageSaveButton
                    onClick={this.handleSubmit}
                    isSubmitting={this.state.isSubmitting}
                />
            </div>
        )
    }
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    }
}

export default PackageForm;