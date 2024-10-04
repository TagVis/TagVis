import { Navbar } from '@/components/navbar/navbar';
import { Camera } from '@/components/mainpage/camera';
import { TableData } from '@/components/mainpage/tabledata';

export const MainPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 flex-col">
        <Camera />
        <TableData />
      </div>
    </div>
  );
};
