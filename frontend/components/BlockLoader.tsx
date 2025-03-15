type BlockLoaderProps = {
  message?: string;
};

const BlockLoader: React.FC<BlockLoaderProps> = ({ message = "Loading" }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Loader Card */}
      <div className="relative bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/20 transform animate-fadeIn">
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner */}
          <div className="relative w-16 h-16">
            {/* Outer spinning circle */}
            <div className="absolute inset-0 rounded-full border-4 border-white/20" />
            <div className="absolute inset-0 rounded-full border-4 border-[#950944] border-t-transparent animate-spin" />

            {/* Inner pulsing circle */}
            <div className="absolute inset-3 rounded-full bg-[#950944]/20 animate-pulse" />
          </div>

          {/* Message */}
          <div className="flex flex-col items-center">
            <p className="text-white text-lg font-medium tracking-wide">
              {message}
            </p>
            <div className="flex items-center space-x-1 mt-1">
              <span className="w-2 h-2 bg-white/80 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-white/80 rounded-full animate-bounce [animation-delay:-0.2s]" />
              <span className="w-2 h-2 bg-white/80 rounded-full animate-bounce [animation-delay:-0.1s]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockLoader;
