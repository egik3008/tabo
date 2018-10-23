import React, { Component } from 'react';
import { database } from '../../services/database';
import ReactTable from 'react-table'
import { Card, CardBody, CardHeader, Col, Row, Button } from 'reactstrap'
import { Link } from 'react-router-dom'
import 'moment/locale/id'
import 'react-table/react-table.css';
import SaveButton from '../commons/ManageSaveButton';

const USD = "USD", IDR = "IDR";

class CurrencyRates extends Component {
  constructor() {
    super()
    this.state = {
        defaultCurrency: IDR,
        filtered: [],
        currencyRates: {
            data: [],
            loaded: false,
            loading: false,
        },
        edited: {},
        savedChange: {}
    }
  }

  componentWillMount() {
    this.fetchData(this.state.defaultCurrency);
  }

  fetchData = (code) => {
    this.setState(prevState => ({
        currencyRates: { ...prevState.currencyRates, loading: true },
    }));

    const db = database.database();
    db.ref('currency_exchange_rates').once('value').then(snap => {
      const curRates = snap.val();
      db.ref('countries')
        .once('value')
        .then(snap => {
            const countries = snap.val();

            let list = [];
            Object.keys(countries).forEach(key => {
                const country = countries[key];
                if (curRates[code + country.currency_code] && country.currency_code !== code) {
                    list.push({
                        id: code + country.currency_code,
                        currency: country.name,
                        isoCode: country.currency_code,
                        rate: curRates[code + country.currency_code]
                    })
                }

                // if (curRates[IDR + country.currency_code] && country.currency_code !== IDR) {
                //     list.push({
                //         id: IDR + country.currency_code,
                //         currency: country.name,
                //         isoCode: country.currency_code,
                //         rate: curRates[IDR + country.currency_code]
                //     })
                // }

            });

            this.setState({
                currencyRates: {
                loading: false,
                loaded: true,
                data: list
                }
            })
        })
    })
  }

  filterCaseInsensitive = (filter, row) => {
    const id = filter.pivotId || filter.id
    if (row[id] !== null) {
      return row[id] !== undefined ? String(row[id].toLowerCase()).includes(filter.value.toLowerCase()) : true
    }
  }

  handleChange = id => event => {
      const rateValue = event.target.value;
      this.setState({
          edited: {
              ...this.state.edited,
              [id]: rateValue
          }
      })
  }

  saveChange = () => {
      this.setState({
        edited: {},
        savedChange: {
            ...this.state.savedChange,
            ...this.state.edited
        }
      });
  }

  render() {
    console.log(this.state.edited);
    console.log(this.state.savedChange);
    const columns = [
      {
        Header: 'Currency ID',
        accessor: 'id',
      },
      {
        Header: 'Currency',
        accessor: 'currency',
      },
      {
        Header: 'ISO Code',
        accessor: 'isoCode'
      },
      {
        Header: 'Exchange Rates',
        accessor: 'rate',
        Cell: row => {
            const val = this.state.edited[row.original.id] 
                || this.state.savedChange[row.original.id] 
                || row.value;

            return <input type="number" 
                onChange={this.handleChange(row.original.id)} 
                value={val}
            />
        },
        sortable: false,
        filterable: false,
      },
      {
        Header: 'Enable',
        accessor: 'id',
        maxWidth: 70,
        sortable: false,
        filterable: false,
        Cell: row => (
          <div style={{ textAlign: 'center' }}>
            <Link to={'/finance/cashout/' + row.value}>
              <i className="fa fa-pencil" />
            </Link>
          </div>
        ),
      },
    ]


    return (
      <div className="animated fadeIn">
        <Row>
          <Col className="mt-2">
            <Card>
              <CardHeader>
                <h3>
                  <strong>Currency Rates</strong>
                </h3>
              </CardHeader>
              <CardBody>
                <h5>Currency Rates</h5>
                <hr className="mt-0 mb-1" />
                <dl className="row mb-2">
                    <dt className="col-sm-3">ISO Code</dt>
                    <dd className="col-sm-9">IDR</dd>

                    <dt className="col-sm-3">Currency</dt>
                    <dd className="col-sm-9">Indonesia</dd>
                </dl>


                <Row className="mb-2 justify-content-end">
                    <Col md="3">
                        <Button 
                            color="primary"
                            className="pull-right"
                            onClick={this.saveChange}
                            disabled={Object.keys(this.state.edited).length < 1}
                        >
                            Save Change
                        </Button>
                    </Col>
                  </Row>
                <ReactTable
                  className="-striped -hightlight"
                  columns={columns}
                  filterable={true}
                  defaultFilterMethod={this.filterCaseInsensitive}
                  sortable={true}
                  defaultSorted={[
                    {
                      id: 'created',
                      desc: true,
                    },
                  ]}
                  defaultPageSize={10}
                  data={this.state.currencyRates.data}
                  loading={this.state.currencyRates.loading}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default CurrencyRates;
