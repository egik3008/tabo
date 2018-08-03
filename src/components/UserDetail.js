import React, { Component } from 'react'

class UserDetail extends Component {
  constructor() {
    super()
  }

  componentWillMount() {
    console.log(this.props)
  }

  render() {
    console.log(this.props)
    return (
      'tes'
    )
  }
}

export default UserDetail
