import React from 'react';
import { useMeetingMode } from '../../hooks/useMeetingMode';
import { HostView } from './HostView';
import { JoinView } from './JoinView';
import { WatchView } from './WatchView';

export const MeetingRoomWithModes = (): JSX.Element => {
  const mode = useMeetingMode();
  
  switch (mode) {
    case 'host':
      return <HostView />;
    case 'join':
      return <JoinView />;
    case 'watch':
      return <WatchView />;
    default:
      return <JoinView />;
  }
};