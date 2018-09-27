import React from 'react';

class LoadingAnimation extends React.Component {
    render() {
      return (
        <div className="row justify-content-center align-items-center" style={{ height: '100vh' }}>
            <i className="fa fa-spinner fa-spin fa-5x fa-fw" />
            <span className="sr-only">Loading...</span>
        </div>
      )
    };
}

export default LoadingAnimation;