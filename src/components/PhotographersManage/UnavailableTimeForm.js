import React from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

import moment from 'moment';
import 'moment/locale/id';

import ManageSaveButton from '../commons/ManageSaveButton';

class UnavailableTimeForm extends React.Component {

    constructor(props) {
        super(props);

        const { notAvailableDates } = props.photographer;
        this.state = {
          selectedDays: this.setSelectedDays(notAvailableDates)
        };
    }

    setSelectedDays = (notAvailableDates) => {
      let notAvailableDatesAsDateObjectList = []
      if (typeof notAvailableDates !== 'undefined') {
        if (notAvailableDates.length > 0) {
          notAvailableDatesAsDateObjectList = notAvailableDates.map(item => new Date(item));
        }
      }
      return notAvailableDatesAsDateObjectList;
    }

    dayClickHandle = (day, { selected }) => {
      const { selectedDays } = this.state;
      if (selected) {
        const selectedIndex = selectedDays.findIndex(selectedDay => DateUtils.isSameDay(selectedDay, day));
        selectedDays.splice(selectedIndex, 1);
      } else {
        selectedDays.push(day);
      }
      this.setState({ selectedDays });
    };

    handleSubmit = () => {
      const { selectedDays } = this.state;
      const notAvailableDates = selectedDays.map(item => (
        moment(item).format('YYYY-MM-DD')
      ));

      this.props.onSubmit(notAvailableDates);
    }
    
    render () {
      const today = new Date();
        return (
          <div className="col-sm-12">
            <div id="schedule" className="schedule-card">
              <DayPicker
                selectedDays={this.state.selectedDays}
                disabledDays={{ before: today }}
                onDayClick={this.dayClickHandle}
              />
            </div>
            <ManageSaveButton 
              onClick={this.handleSubmit}
              isSubmitting={this.props.isSubmitting}
            />
          </div>
        );
    }
}

export default UnavailableTimeForm;