const LoadingOverlay = ({ visible }) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white animate-spin" />
    </div>
  );
};

export default LoadingOverlay;
