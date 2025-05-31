import { ReactNode, RefObject } from 'react';
import { LayoutAnimationConfig } from 'react-native';
import MapView, { EdgePadding, MapViewProps } from 'react-native-maps';
import Supercluster from 'supercluster';

export type ClusteredMapViewProps = {
  radius?: number;
  maxZoom?: number;
  minZoom?: number;
  minPoints?: number;
  extent?: number;
  nodeSize?: number;
  preserveClusterPressBehavior?: boolean;
  clusteringEnabled: true;
  clusterColor?: string;
  clusterTextColor?: string;
  clusterFontFamily?: string;
  spiderLineColor?: string;
  layoutAnimationConf?: LayoutAnimationConfig;
  animationEnabled?: boolean;
  renderCluster?: (clusterProps: any) => ReactNode;
  tracksViewChanges?: boolean;
  spiralEnabled?: boolean;
  superClusterRef?: RefObject<Supercluster | null>;
  edgePadding?: EdgePadding;
  onClusterPress?: (cluster: any, children: any) => void;
  onMarkersChange?: (markers: any) => void;
  mapRef?: ((ref: MapView | null) => void) | RefObject<MapView | null>;
} & MapViewProps;
