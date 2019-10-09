import React from 'react';
import { compose, withProps, lifecycle } from 'recompose';
import get from 'lodash/get';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} from 'react-google-maps';
import SearchBox from 'react-google-maps/lib/components/places/SearchBox';

const DEFAULT_CENTER = {
  lat: 41.9,
  lng: -87.624,
}

const MapWithASearchBox = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyDR0sSVwB-0DQvA2A-5Bu5Xs8sG9r1u2Ug&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{height: `100%`}}/>,
    containerElement: <div style={{height: `400px`, marginBottom: 50}}/>,
    mapElement: <div style={{height: `100%`}}/>
  }),
  lifecycle({
    componentWillMount() {
      const refs = {};
      this.setState({
        specificLocation: '',
        bounds: null,
        center: DEFAULT_CENTER,
        markers: [],
        onMapMounted: ref => {
          refs.map = ref;
          if (!ref) { return }
        },
        onBoundsChanged: () => {
          this.setState({
            bounds: refs.map.getBounds(),
            center: refs.map.getCenter(),
          });
        },
        onSearchBoxMounted: ref => {
          refs.searchBox = ref;
        },
        onPlacesChanged: () => {
          const places = refs.searchBox.getPlaces();
          const bounds = new window.google.maps.LatLngBounds();

          places.forEach(place => {
            if (place.geometry.viewport) {
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });

          const nextMarkers = places.map(place => ({
            position: place.geometry.location,
          }));

          const nextCenter = get(
            nextMarkers,
            '0.position',
            this.state.center
          );

          this.setState({
            center: nextCenter,
            markers: nextMarkers,
            generalLocation: {
              lat: places[0].geometry.location.lat(),
              long: places[0].geometry.location.lng(),
              meetingPointName: places[0].name,
              formattedAddress: places[0].formatted_address || ''
            },
          });
        },
        handleSpecificLocation: event => {
          this.setState({ specificLocation: event.target.value });
        },
        handleAddition: () => {
          const generalLocation = get(this.state, 'generalLocation', null);
          const specificLocation = get(this.state, 'specificLocation', null).trim();
          
          this.props.handleAddition({ generalLocation, specificLocation });
          this.setState({
            center: DEFAULT_CENTER,
            markers: [],
            generalLocation: null,
            specificLocation: ""
          });

          document.getElementById('inputSearchBox').value = "";
          document.getElementById('inputPlaceNote').value = "";
        },
      });
    },
    componentWillReceiveProps(props) {
      if (props.meetingPoint) {
        const center = {
          lat: props.meetingPoint.lat,
          lng: props.meetingPoint.long
        };
        const markers = [{position: center}];
        const defaultNote = props.meetingPoint.placeLocationNotes;
  
        this.setState({
          center,
          markers,
          generalLocation: {
            lat: props.meetingPoint.lat,
            long: props.meetingPoint.long,
            meetingPointName: props.meetingPoint.meetingPointName,
            formattedAddress: props.meetingPoint.formattedAddress
          },
          specificLocation: defaultNote
        });
      } else {
        this.setState({
          specificLocation: ""
        })
      }
    }
  }),
  withScriptjs,
  withGoogleMap
)(props => {
    return (
        <div>
          <GoogleMap
            ref={props.onMapMounted}
            defaultZoom={15}
            center={props.center}
            onBoundsChanged={props.onBoundsChanged}
          >
            <div className="row" id="meeting-points">
              <SearchBox
                key={1}
                ref={props.onSearchBoxMounted}
                bounds={props.bounds}
                controlPosition={1}
                onPlacesChanged={props.onPlacesChanged}
              >
                <input
                  id="inputSearchBox"
                  type="text"
                  placeholder="Place / location name"
                  className="input-place-location-name"
                  style={{
                      boxSizing: `border-box`,
                      border: `1px solid transparent`,
                      height: `40px`,
                      padding: `0 12px`,
                      borderRadius: `3px`,
                      boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                      fontSize: `16px`,
                      outline: `none`,
                      textOverflow: `ellipses`,
                  }}
                />
              </SearchBox>
      
              {
                props.markers && props.markers.map((marker, index) => (<Marker key={index} position={marker.position} />))
              }
            </div>
          </GoogleMap>
      
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <input
              id="inputPlaceNote"
              className="form-control"
              onChange={props.handleSpecificLocation}
              type="text"
              value={props.specificLocation}
              placeholder="Notes for this place / location"
              style={{
                border: `1px solid transparent`,
                height: `40px`,
                padding: `0 12px`,
                margin: '10px 0 0 0',
                borderRadius: `3px`,
                boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                fontSize: `16px`,
                outline: `none`,
                textOverflow: `ellipses`,
              }}
            />
      
            <button
              onClick={props.handleAddition}
              className="button"
              style={{
                border: `1px solid transparent`,
                height: `40px`,
                padding: `0 12px`,
                margin: '10px 0 0 10px',
                borderRadius: `3px`,
                boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                fontSize: `15px`,
                outline: `none`,
                textOverflow: `ellipses`,
              }}
            >
              { props.isEditMode ? "Update" : "Add" }
            </button>
          </div>
      
        </div>
    );
});

export default MapWithASearchBox;
