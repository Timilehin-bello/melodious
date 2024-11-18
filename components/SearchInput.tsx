import { Search } from "lucide-react";
import { Input } from "./ui/input";

const SearchInput = () => {
  return (
    <div className="relative">
      <Input
        type="text"
        className="pl-10 pr-4 py-2 border-[#D1E1E11C] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500 w-full h-[45px] sm:w-[500px] md:w-[600px] lg:w-[726px] xl:w-[800px] 2xl:w-[900px]"
        placeholder="Search..."
      />
      <div className="absolute inset-y-0 left-0 bottom-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-gray-500" />
      </div>
    </div>
  );
};

export default SearchInput;
