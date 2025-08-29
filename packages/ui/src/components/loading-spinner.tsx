interface LoadingSpinnerProps {
  loading: boolean;
}

export const LoadingSpinner = ({ loading }: LoadingSpinnerProps) => {
  return (
    <div className="h-12 flex items-center justify-center">
      {loading && (
        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      )}
    </div>
  );
};
