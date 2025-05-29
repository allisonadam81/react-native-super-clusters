/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StyleSheet, Text, SafeAreaView, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import ClusteredMapView from '@allisonadam81/react-native-super-clusters';

export const initialRegionDeltas = {
  longitudeDelta: 0.09,
  latitudeDelta: 0.09,
};

// Utility locations in Los Angeles
const utilityMarkers = [
  {
    id: '1',
    title: 'LA Department of Water and Power',
    description: 'Main office',
    coordinate: {
      latitude: 34.0505,
      longitude: -118.2478,
    },
  },
  {
    id: '2',
    title: 'LA Sanitation & Environment',
    description: 'Public works',
    coordinate: {
      latitude: 34.0561,
      longitude: -118.2365,
    },
  },
  {
    id: '3',
    title: 'LA Metro Headquarters',
    description: 'Public transportation',
    coordinate: {
      latitude: 34.0548,
      longitude: -118.2352,
    },
  },
  {
    id: '4',
    title: 'LA Fire Station #3',
    description: 'Emergency services',
    coordinate: {
      latitude: 34.0601,
      longitude: -118.2519,
    },
  },
  {
    id: '5',
    title: 'City Hall Power Distribution',
    description: 'Utility substation',
    coordinate: {
      latitude: 34.0535,
      longitude: -118.2398,
    },
  },
];

function App(): React.JSX.Element {
  const downtown_la = {
    latitude: 34.0522,
    longitude: -118.2437,
    ...initialRegionDeltas,
  };

  return (
    <SafeAreaView style={[styles.container]}>
      <View style={[styles.mapContainer]}>
        <Text style={[styles.text]}>Downtown Los Angeles Utilities</Text>
        <MapView style={styles.map} initialRegion={downtown_la}>
          {utilityMarkers.map(marker => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
            />
          ))}
        </MapView>
        <ClusteredMapView style={styles.map} initialRegion={downtown_la}>
          {utilityMarkers.map(marker => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
            />
          ))}
        </ClusteredMapView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: {
    height: '100%',
    paddingHorizontal: 16,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '35%',
  },
  text: {
    padding: 24,
  },
});

export default App;
