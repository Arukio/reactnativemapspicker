import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Dimensions,
  Image,
  View,
  StatusBar,
  TouchableOpacity
} from "react-native";

import MapView from "react-native-maps";
import Polyline from "@mapbox/polyline";

class LocationA extends Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: null,
      longitude: null,
      error: null,
      concat: null,
      coords: [],
      x: "false",
      cordLatitude: -6.23,
      cordLongitude: 106.75,
      loading: true
    };

    this.mergeLot = this.mergeLot.bind(this);
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false
        });

        this.mergeLot("-6.23,106.75");
      },
      error => this.setState({ error: error.message })
    );
  }

  mergeLot(destination) {
    if (this.state.latitude != null && this.state.longitude != null) {
      let concatLot = this.state.latitude + "," + this.state.longitude;
      this.setState({
        concat: concatLot
      });
      this.getDirections(concatLot, destination);
    }
  }

  async getDirections(startLoc, destinationLoc) {
    try {
      let resp = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}`
      );
      let respJson = await resp.json();
      let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
      let coords = points.map((point, index) => {
        return {
          latitude: point[0],
          longitude: point[1]
        };
      });
      this.setState({ coords: coords });
      this.setState({ x: "true" });
      return coords;
    } catch (error) {
      console.log("masuk fungsi");
      this.setState({ x: "error" });
      return error;
    }
  }

  handlePress = coordinate => {
    let latlong = coordinate.latitude + "," + coordinate.longitude;
    this.setState({
      cordLatitude: coordinate.latitude,
      cordLongitude: coordinate.longitude
    });
    this.mergeLot(latlong);
  };

  render() {
    if (this.state.loading) {
      return null;
    }

    return (
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: this.state.latitude,
          longitude: this.state.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005
        }}
        onPress={({ nativeEvent }) => this.handlePress(nativeEvent.coordinate)}
      >
        {!!this.state.latitude &&
          !!this.state.longitude && (
            <MapView.Marker
              coordinate={{
                latitude: this.state.latitude,
                longitude: this.state.longitude
              }}
              title={"Your Location"}
            />
          )}

        {!!this.state.cordLatitude &&
          !!this.state.cordLongitude && (
            <MapView.Marker
              coordinate={{
                latitude: this.state.cordLatitude,
                longitude: this.state.cordLongitude
              }}
              title={"Your Destination"}
            />
          )}

        {!!this.state.latitude &&
          !!this.state.longitude &&
          this.state.x == "true" && (
            <MapView.Polyline
              coordinates={this.state.coords}
              strokeWidth={5}
              strokeColor="red"
            />
          )}

        {!!this.state.latitude &&
          !!this.state.longitude &&
          this.state.x == "error" && (
            <MapView.Polyline
              coordinates={[
                {
                  latitude: this.state.latitude,
                  longitude: this.state.longitude
                },
                {
                  latitude: this.state.cordLatitude,
                  longitude: this.state.cordLongitude
                }
              ]}
              strokeWidth={5}
              strokeColor="red"
            />
          )}
      </MapView>
    );
  }
}

const styles = StyleSheet.create({
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});

export default LocationA;
