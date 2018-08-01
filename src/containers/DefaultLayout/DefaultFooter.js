import React, { Component } from 'react'

class DefaultFooter extends Component {
  render() {
    return (
      <React.Fragment>
        <span><a href="#">Tabo</a> &copy; 2018 Takapic.</span>
        <span className="ml-auto">Powered by <a href="https://coreui.io/react">CoreUI for React</a></span>
      </React.Fragment>
    )
  }
}

export default DefaultFooter
