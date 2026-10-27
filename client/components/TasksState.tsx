import { Alert, Button, EmptyState, Loading } from "./ui";

interface Props {
  loading: boolean;
  error: string;
  unavailable: boolean;
  onRetry: () => void;
}

// Shows loading / not-connected / error states. Returns null when tasks can be shown.
export default function TasksState({ loading, error, unavailable, onRetry }: Props) {
  if (loading) return <Loading text="Loading tasks..." />;
  if (unavailable)
    return (
      <EmptyState
        title="Tasks are not connected yet"
        text="The backend does not have task endpoints yet (GET/POST /tasks). Once they exist, your tasks will show up here."
      />
    );
  if (error)
    return (
      <div className="space-y-3">
        <Alert>{error}</Alert>
        <Button variant="secondary" onClick={onRetry}>Retry</Button>
      </div>
    );
  return null;
}
