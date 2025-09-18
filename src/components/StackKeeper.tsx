import { StackKeeperRefactored } from "./StackKeeper/StackKeeperRefactored";

interface StackKeeperProps {
  showInterventionsPanel?: boolean;
}

export const StackKeeper = ({ showInterventionsPanel = true }: StackKeeperProps) => {
  return <StackKeeperRefactored showInterventionsPanel={showInterventionsPanel} />;
};