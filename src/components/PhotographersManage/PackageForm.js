import React from 'react';
import {
    Table
} from 'reactstrap';

class PackageForm extends React.Component {
    state = {
        packageName: '',
        packagePrice: ''
    }
    handleAddPackagePrice = () => {
        this.props.onAddPackagePrice(this.state);
    }

    render() {
        return (
            <div>
                <Table responsive bordered className="mt-3">
                    <thead>
                        <tr>
                        <th>Hour</th>
                        {/* <th>Photos</th> */}
                        <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.packagesPrice.map((p, i) => (
                        <tr key={i}>
                            <td>{p.packageName}</td>
                            {/* <td>{p.requirement}</td> */}
                            <td>{p.priceIDR ? p.priceIDR.toLocaleString('id') : Number(p.price).toLocaleString('id')}</td>
                        </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        )
    }
}

export default PackageForm;