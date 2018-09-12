import React from 'react';
import {
    Table,
    FormGroup,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Input,
} from 'reactstrap';
import ManageSaveButton from '../commons/ManageSaveButton';


class PackageForm extends React.Component {
    state = {
        packagesPrice: [
            {id: "PKG1", packageName: "1 hour", price: 0},
            {id: "PKG2", packageName: "2 hour", price: 0},
            {id: "PKG3", packageName: "4 hour", price: 0},
            {id: "PKG4", packageName: "8 hour", price: 0},
        ]
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
        this.props.onSubmit(this.state.packagesPrice);
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
                    isSubmitting={this.props.isSubmitting}
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