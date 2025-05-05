import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import VictorySplash from './VictorySplash';
import SigilPulse from './SigilPulse';
import StardustSwirl from './StardustSwirl';

type FxLayerProps = {
  holeCleared: boolean;
  showSigil: boolean;
  sigilHue?: number;
  vortexOn: boolean;
  onVictoryComplete?: () => void;
};

export default function FxLayer({
  holeCleared,
  showSigil,
  sigilHue = 0,
  vortexOn,
  onVictoryComplete,
}: FxLayerProps) {
  return (
    <View style={styles.container} pointerEvents="none">
      <VictorySplash
        active={holeCleared}
        onComplete={onVictoryComplete}
      />
      <SigilPulse
        active={showSigil}
        hue={sigilHue}
      />
      <StardustSwirl
        active={vortexOn}
        particleCount={30}
        radius={150}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});