type BlockLoaderProps = {
  message?: string;
};

const BlockLoader: React.FC<BlockLoaderProps> = ({ message }) => {
  return (
    <div>
      <div className="fixed inset-0 flex items-center justify-center bg-black/80 bg-opacity-75 z-50">
        <div className="flex gap-2 items-center text-gray-200">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-8 w-8"></div>
          <p className="text-medium">{message}...</p>
        </div>
      </div>
    </div>
  );
};

export default BlockLoader;
