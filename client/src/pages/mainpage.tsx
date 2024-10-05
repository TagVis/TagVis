import { Navbar } from "@/components/navbar/navbar";
import { Camera } from "@/components/mainpage/camera";
import { DataTables } from "@/components/mainpage/datatables";
import { DataInDataTables } from "@/components/mainpage/dataindatatables";

export const MainPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 flex-col">
        <Camera />
        <DataTables />
        <DataInDataTables />
      </div>
    </div>
  );
};
