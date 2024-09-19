import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex w-full h-screen relative">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Container */}
      <div className="flex-1 flex relative bg-cover bg-center bg-[url('/images/main_background.svg')] overflow-y-auto overflow-hidden">
        {/* Overlay for better text visibility */}
        {/* <div className="absolute inset-0 bg-gradient-to-b from-[#20123C] via-transparent to-black/20 opacity-100" aria-hidden="true"></div> */}
        <Header />

        {/* Main content area */}
        <div className="flex-1 flex flex-col h-screen text-white overflow-y-auto no-scrollbar">
          {/* Navbar */}

          {/* Main content */}
          <main className="p-4 flex-1  mt-16">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
