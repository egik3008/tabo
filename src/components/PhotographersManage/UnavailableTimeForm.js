import React from 'react';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/id';
import ManageSaveButton from '../commons/ManageSaveButton';

class UnavailableTimeForm extends React.Component {

    constructor(props) {
        super(props)
        BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment))
    }
    
    render () {
        const { photographer } = this.props;

        return (
          <div>
            <div style={{ height: '100vh', width: '100%' }}>
              <BigCalendar
                events={
                  'notAvailableDates' in photographer
                    ? photographer.notAvailableDates.map((item, i) => {
                        return {
                          id: i,
                          title: 'Unavailable',
                          allDay: true,
                          start: new Date(item),
                          end: new Date(item),
                        }
                      })
                    : []
                }
                defaultDate={new Date()}
                views={{ month: true }}
              />
            </div>
            <ManageSaveButton />
          </div>
        );
    }
}

export default UnavailableTimeForm;