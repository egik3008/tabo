import React, { Component } from 'react'
import { DropdownItem, DropdownMenu, DropdownToggle, Nav } from 'reactstrap'
import { AppHeaderDropdown, AppNavbarBrand, AppSidebarToggler } from '@coreui/react'
import logo from '../../assets/img/brand/logo.png'
import icon from '../../assets/img/brand/icon_black.ico'
import defaultAvatar from '../../assets/img/avatar/user.png'

const defaultProps = {}

class DefaultHeader extends Component {
  render() {
    // eslint-disable-next-line
    const { children, ...attributes } = this.props

    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        <AppNavbarBrand
          full={{ src: logo, height: 25, alt: 'Takapic Logo' }}
          minimized={{ src: icon, width: 30, height: 30, alt: 'Takapic Logo' }}
        />
        <AppSidebarToggler className="d-md-down-none" display="lg" />

        <Nav className="ml-auto" navbar>
          <AppHeaderDropdown direction="down">
            <DropdownToggle nav>
              <img src={defaultAvatar} className="img-avatar" alt="admin@bootstrapmaster.com" />
            </DropdownToggle>
            <DropdownMenu right style={{ right: 'auto' }}>
              <DropdownItem header tag="div" className="text-center">
                <strong>Account</strong>
              </DropdownItem>
              <DropdownItem>
                <i className="fa fa-user" /> Profile
              </DropdownItem>
              <DropdownItem>
                <i className="fa fa-lock" /> Logout
              </DropdownItem>
            </DropdownMenu>
          </AppHeaderDropdown>
        </Nav>
      </React.Fragment>
    )
  }
}

DefaultHeader.defaultProps = defaultProps

export default DefaultHeader
