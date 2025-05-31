import {
  memo,
  useState,
  useEffect,
  useMemo,
  useRef,
  forwardRef,
  Children,
  cloneElement,
} from 'react';
import { Dimensions, LayoutAnimation, Platform } from 'react-native';
import MapView, { MapViewProps, Polyline } from 'react-native-maps';
import SuperCluster from 'supercluster';
import ClusterMarker from '../ClusteredMarker';
import {
  isMarker,
  markerToGeoJSONFeature,
  calculateBBox,
  returnMapZoom,
  generateSpiral,
} from '../utils';
import { ClusteredMapViewProps } from './types';

const defaultEdgePadding = { top: 50, left: 50, right: 50, bottom: 50 };

const ClusteredMapView = forwardRef<MapView, ClusteredMapViewProps>(
  (props, ref) => {
    const {
      radius = Dimensions.get('window').width * 0.06,
      maxZoom = 20,
      minZoom = 1,
      minPoints = 2,
      extent = 512,
      nodeSize = 64,
      children,
      onClusterPress,
      onRegionChangeComplete,
      onMarkersChange,
      preserveClusterPressBehavior = false,
      clusteringEnabled = true,
      clusterColor = '#00B386',
      clusterTextColor = '#FFFFFF',
      clusterFontFamily,
      spiderLineColor = '#FF0000',
      layoutAnimationConf = LayoutAnimation.Presets.spring,
      animationEnabled = true,
      renderCluster,
      tracksViewChanges = false,
      spiralEnabled = true,
      superClusterRef,
      edgePadding = defaultEdgePadding,
      ...restProps
    } = props;
    const [markers, updateMarkers] = useState([]);
    const [spiderMarkers, updateSpiderMarker] = useState([]);
    const [otherChildren, updateChildren] = useState([]);
    const [superCluster, setSuperCluster] = useState<SuperCluster | null>(null);
    const [currentRegion, updateRegion] = useState(
      restProps.region || restProps.initialRegion,
    );

    const [isSpiderfier, updateSpiderfier] = useState(false);
    const [clusterChildren, updateClusterChildren] = useState(null);
    const mapRef = useRef<MapView>(null);

    const propsChildren = useMemo(() => Children.toArray(children), [children]);

    useEffect(() => {
      const rawData = [];
      const otherChildren = [];

      if (!clusteringEnabled) {
        updateSpiderMarker([]);
        updateMarkers([]);
        updateChildren(propsChildren);
        setSuperCluster(null);
        return;
      }

      propsChildren.forEach((child, index) => {
        if (isMarker(child)) {
          rawData.push(markerToGeoJSONFeature(child, index));
        } else {
          otherChildren.push(child);
        }
      });

      const superCluster = new SuperCluster({
        radius,
        maxZoom,
        minZoom,
        minPoints,
        extent,
        nodeSize,
      });

      superCluster.load(rawData);

      const bBox = calculateBBox(currentRegion);
      const zoom = returnMapZoom(currentRegion, bBox, minZoom);
      const markers = superCluster.getClusters(bBox, zoom);

      updateMarkers(markers);
      updateChildren(otherChildren);
      setSuperCluster(superCluster);

      superClusterRef && (superClusterRef.current = superCluster);
    }, [propsChildren, clusteringEnabled, superClusterRef]);

    useEffect(() => {
      if (!spiralEnabled) return;

      if (isSpiderfier && markers.length > 0) {
        let allSpiderMarkers = [];
        let spiralChildren = [];
        markers.map((marker, i) => {
          if (marker.properties.cluster) {
            spiralChildren = superCluster?.getLeaves(
              marker.properties.cluster_id,
              Infinity,
            );
          }
          let positions = generateSpiral(marker, spiralChildren, markers, i);
          allSpiderMarkers.push(...positions);
        });

        updateSpiderMarker(allSpiderMarkers);
      } else {
        updateSpiderMarker([]);
      }
    }, [isSpiderfier, markers]);

    const _onRegionChangeComplete: NonNullable<
      MapViewProps['onRegionChangeComplete']
    > = (region, details) => {
      if (superCluster && region) {
        const bBox = calculateBBox(region);
        const zoom = returnMapZoom(region, bBox, minZoom);
        const markers = superCluster.getClusters(bBox, zoom);
        if (animationEnabled && Platform.OS === 'ios') {
          LayoutAnimation.configureNext(layoutAnimationConf);
        }
        if (zoom >= 18 && markers.length > 0 && clusterChildren) {
          if (spiralEnabled) updateSpiderfier(true);
        } else {
          if (spiralEnabled) updateSpiderfier(false);
        }
        updateMarkers(markers);
        onMarkersChange && onMarkersChange(markers);
        onRegionChangeComplete && onRegionChangeComplete(region, markers);
        updateRegion(region);
      } else {
        onRegionChangeComplete && onRegionChangeComplete(region, details);
      }
    };

    const _onClusterPress = cluster => () => {
      const children = superCluster?.getLeaves(cluster.id, Infinity);
      updateClusterChildren(children);

      if (preserveClusterPressBehavior) {
        onClusterPress && onClusterPress(cluster, children);
        return;
      }

      const coordinates = children.map(({ geometry }) => ({
        latitude: geometry.coordinates[1],
        longitude: geometry.coordinates[0],
      }));

      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: restProps.edgePadding,
      });

      onClusterPress && onClusterPress(cluster, children);
    };

    const assignRef = (map: MapView | null) => {
      mapRef.current = map;
      if (ref) {
        if (typeof ref === 'function') {
          ref(map);
        } else {
          ref.current = map;
        }
      }
      if (restProps.mapRef) {
        if (typeof restProps.mapRef === 'function') {
          restProps.mapRef(map);
        } else {
          restProps.mapRef.current = map;
        }
      }
    };

    return (
      <MapView
        {...restProps}
        ref={assignRef}
        onRegionChangeComplete={_onRegionChangeComplete}>
        {markers.map(marker =>
          marker.properties.point_count === 0 ? (
            propsChildren[marker.properties.index]
          ) : !isSpiderfier ? (
            renderCluster ? (
              renderCluster({
                onPress: _onClusterPress(marker),
                clusterColor,
                clusterTextColor,
                clusterFontFamily,
                ...marker,
              })
            ) : (
              <ClusterMarker
                key={`cluster-${marker.id}`}
                {...marker}
                onPress={_onClusterPress(marker)}
                clusterColor={
                  restProps.selectedClusterId === marker.id
                    ? restProps.selectedClusterColor
                    : clusterColor
                }
                clusterTextColor={clusterTextColor}
                clusterFontFamily={clusterFontFamily}
                tracksViewChanges={tracksViewChanges}
              />
            )
          ) : null,
        )}
        {otherChildren}
        {spiderMarkers.map(marker => {
          return propsChildren[marker.index]
            ? cloneElement(propsChildren[marker.index], {
                coordinate: { ...marker },
              })
            : null;
        })}
        {spiderMarkers.map((marker, index) => (
          <Polyline
            key={index}
            coordinates={[marker.centerPoint, marker, marker.centerPoint]}
            strokeColor={spiderLineColor}
            strokeWidth={1}
          />
        ))}
      </MapView>
    );
  },
);

export default memo(ClusteredMapView);
