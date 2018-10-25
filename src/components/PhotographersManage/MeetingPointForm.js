import React from 'react';
import uuidv4 from 'uuid/v4';
import get from 'lodash/get';
import Swal from 'sweetalert2';
import {
    Button,
    Table,
} from 'reactstrap';
import MapWithASearchBox from '../commons/MapWithSearchBox';
import ManageSaveButton from '../commons/ManageSaveButton';

class MeetingPointForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            meetingPoints: props.photographer.meetingPoints,
            editMeetingPoint: null,
            isEdit: null, 
        }
    }

    handleSubmit = () => {
        this.props.onSubmit(this.state.meetingPoints);
        this.handleCancelEdit();
    }

    handleOnEdit = (editMeetingPoint) => () => {
        this.setState({
            editMeetingPoint,
            isEdit: editMeetingPoint.id
        });
    }

    handleCancelEdit = () => {
        this.setState({
            editMeetingPoint: null,
            isEdit: null
        })
    }

    handlePlaceChange = () => {
        this.setState({editMeetingPoint: null});
    }

    handleDelete = (meetingPointID) => () => {
        const meetingPoints = this.state.meetingPoints.filter(mp => {
            return !(mp.id === meetingPointID);
        });

        this.setState({meetingPoints});

    }

    handleAddition = params => {
        let generalLocation = get(params, 'generalLocation');
        const specificLocation = get(params, 'specificLocation', '-');

        if ((generalLocation && this.state.meetingPoints.length < 3) || this.state.isEdit){
            let uuid = uuidv4();
            let meetingPointsLocal = Object.assign(
                generalLocation, { 
                    placeLocationNotes: specificLocation, 
                    id: uuid 
                }
            );

            let currentMeetingPoints = this.state.meetingPoints;

            if (this.state.isEdit) {
                currentMeetingPoints = this.state.meetingPoints.filter(mp => {
                    return !(mp.id === this.state.isEdit);
                });
            }

            const meetingPoints = [ 
                ...currentMeetingPoints,
                meetingPointsLocal
            ];

            this.setState({meetingPoints});
            this.handleCancelEdit();
        } else {
            Swal('', 'Sorry, meeting points is limited to three.', 'info');
        }
    };

    render() {
        const { meetingPoints } = this.state;
        return (
            <div>
                <MapWithASearchBox 
                    meetingPoint={this.state.editMeetingPoint}
                    isEditMode={this.state.isEdit}
                    handleAddition={this.handleAddition} 
                    onPlaceChange={this.handlePlaceChange}    
                />
                <Table responsive bordered className="mt-3">
                <thead>
                    <tr>
                        <th className="td-center">No</th>
                        <th>Address</th>
                        <th className="td-center">Action</th>
                    </tr>
                </thead>
                    <tbody>
                        {meetingPoints.length > 0 ? meetingPoints.map((p, i) => {
                            const isEdit = p.id === this.state.isEdit;
                            return (
                                <tr key={p.id}>
                                    <td className="td-center">{i + 1}</td>
                                    <td>
                                        <p>{p.meetingPointName}</p>
                                        <p>
                                            <strong>Note: </strong>
                                            {p.placeLocationNotes}
                                        </p>
                                    </td>
                                    <td className="td-center" >
                                    <Button 
                                        color={isEdit ? "warning" : "secondary"}
                                        style={{marginRight: 5}}
                                        onClick={isEdit ? this.handleCancelEdit:this.handleOnEdit(p)}
                                    >
                                        {isEdit ? "Cancel Edit" : "Edit" }
                                    </Button>
                                    {!isEdit && (
                                        <Button
                                            style={{marginLeft: 5}}
                                            color="danger"
                                            onClick={this.handleDelete(p.id)}
                                        >
                                            Delete
                                        </Button>
                                    )}
                                    </td>
                                </tr>
                            )
                        }) : (
                            <tr>
                                <td colSpan="3" className="td-center">
                                    There is no meeting point 
                                </td>
                            </tr>
                        )
                        }
                    </tbody>
                </Table>

                <ManageSaveButton 
                    onClick={this.handleSubmit}
                    isSubmitting={this.props.isSubmitting}
                />
            </div>
        );
    }
}

export default MeetingPointForm;