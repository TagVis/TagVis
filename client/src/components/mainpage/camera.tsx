import { Card, CardContent } from "@/components/ui/card";

export const Camera = () => {
  return (
    <div className="flex flex-col items-center p-4 space-y-8">
      <Card className="">
        <CardContent>
          <div>
            <img 
              src="https://www.shutterstock.com/image-vector/camera-viewfinder-interface-recording-screen-600nw-1779361169.jpg" 
              alt="Camera Viewfinder" 
              className="w-full h-auto"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
