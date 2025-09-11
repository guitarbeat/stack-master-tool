import { StackKeeper as StackKeeperRefactored } from "./StackKeeper";

interface StackKeeperProps {
  showInterventionsPanel?: boolean;
}

export const StackKeeper = ({ showInterventionsPanel = true }: StackKeeperProps) => {
  return <StackKeeperRefactored showInterventionsPanel={showInterventionsPanel} />;
};