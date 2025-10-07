import { FC } from 'react';

interface ConfettiProps {
  triggerKey?: number;
  key?: number;
}

declare const Confetti: FC<ConfettiProps>;
export default Confetti;
