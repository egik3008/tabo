import React from 'react';
import moment from 'moment';
import 'moment/locale/id';

export const displayDateFormat = (date) => {
    return date ? (
      <React.Fragment>
        {moment(date).format('DD/MM/YYYY')}
        <br/>
        {moment(date).format('HH:mm:ss')}
      </React.Fragment>
    ): '-';
  }