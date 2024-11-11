import { Navbar } from "@/components/navbar/navbar";
import { Camera } from "@/components/mainpage/camera";
import { DataTables } from "@/components/mainpage/datatables";
import { DataInDataTables } from "@/components/mainpage/dataindatatables";

export const MainPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 flex-col items-center space-y-4">
        {/* Centered and resized Camera component */}
        <div className="w-3/4 md:w-2/3 lg:w-1/2 flex justify-center">
          <Camera />
        </div>

        {/* DataTables and DataInDataTables components remain unaffected */}
        <div className="w-full">
          <DataTables />
        </div>
        <div className="w-full">
          <DataInDataTables />
        </div>
      </div>
    </div>
  );
};

