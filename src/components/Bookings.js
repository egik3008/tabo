import React, { Component } from 'react';
import { database } from "../services/database";

import Page from '../Page';

class Bookings extends Component {
  constructor() {
    super();
    this.state = {
      bookings: []
    };
  }

  render() {
    return (
      <Page>
        <h2>Bookings</h2>
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>X</th>
              <th>Y</th>
              <th>Z</th>
              <th>I</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>1</td>
              <td>X Content 1</td>
              <td>Y Content 1</td>
              <td>Z Content 1</td>
              <td>I Content 1</td>
            </tr>

            <tr>
              <td>2</td>
              <td>X Content 2</td>
              <td>Y Content 2</td>
              <td>Z Content 2</td>
              <td>I Content 2</td>
            </tr>

            <tr>
              <td>3</td>
              <td>X Content 3</td>
              <td>Y Content 3</td>
              <td>Z Content 3</td>
              <td>I Content 3</td>
            </tr>
          </tbody>
        </table>
      </Page>
    );
  }
}

export default Bookings;
