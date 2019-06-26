import React, { Component } from 'react';
import database from '../services/database';
import axios from 'axios';
import { CSVLink } from "react-csv";

import {
  Button
} from 'reactstrap';

class Testing extends Component {
  state = { data: [] }

  componentDidMount() {
    let dataList = [], query = [];
    axios
      .get(`${process.env.REACT_APP_API_HOSTNAME}/api/users/?type=p`)
      .then(response => {
        const pgList = response.data;
        for (let key in pgList) {
          query.push(
            database.database()
              .ref('photographer_service_information')
              .child(pgList[key].uid)
              .once('value')
              .then(snap => {
                  let pgServices = snap.val();
                  const pkg = pgServices.packagesPrice;
                  dataList.push({
                    uid: pgList[key].uid,
                    pgName: pgList[key].displayName,
                    phoneNumber: `'${pgList[key].phoneDialCode || ""}${pgList[key].phoneNumber || ""}`,
                    email: pgList[key].email,
                    location: pgList[key].locationAdmLevel2,
                    currency: pgList[key].currency || "",
                    pkg1: (pkg && pkg[0] ? pkg[0].price : 0),
                    pkg2: (pkg && pkg[1] ? pkg[1].price : 0),
                    pkg3: (pkg && pkg[2] ? pkg[2].price : 0),
                    pkg4: (pkg && pkg[3] ? pkg[3].price : 0),
                  })
              })
          )
        }

        Promise.all(query).then(() => {
          this.setState({ data: dataList });
        });
      })
      .catch(error => {
        console.error(error)
      })
  }

  getCSVData = () => {
    const { data } = this.state;
    return data.map((dt, index) => ({
      "No": (index + 1),
      "ID": dt.uid,
      "PG Name": dt.pgName,
      "Phone Number": dt.phoneNumber,
      "Email": dt.email,
      "Location": dt.location,
      "Currency": dt.currency,
      "1 Hour": Number(dt.pkg1).toLocaleString(),
      "2 Hour": Number(dt.pkg2).toLocaleString(),
      "4 Hour": Number(dt.pkg3).toLocaleString(),
      "8 Hour": Number(dt.pkg4).toLocaleString(),
    }));
  }

  render() {
    const data = this.getCSVData();
     if (data.length < 1) {
       return <p>Loading...</p>
     }
    return (
      <React.Fragment>
          <h3>This is Testing</h3>
          <CSVLink 
            data={data}
            filename={"data.csv"}
            target="_blank"
          >
            <Button block color="primary">
              Export Data PG
            </Button>
          </CSVLink>   
      </React.Fragment>
    )
  }
}

export default Testing;
