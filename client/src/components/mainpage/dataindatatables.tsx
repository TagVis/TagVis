import useSWR, { mutate } from "swr";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "../loadingspinner/loadingspinner";
import { Button } from "@/components/ui/button";

interface TagDataInDataTables {
  tag_id: number;
  part_no: string | null;
  po: string | null;
  quantity: number | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Function to delete a single tag by TagID
const deleteTagByTagId = async (tag_id: number) => {
  await fetch(`/api/DeleteTagByTagId/${tag_id}`, { method: "DELETE" });
  // Revalidate data after deletion
  mutate("/api/GetTags");
  // Also revalidate the DataTables data
  mutate("/api/GetTagDataTables");
};

// Function to delete all tags
const deleteAllTags = async () => {
  await fetch("/api/DeleteTags", { method: "DELETE" });
  // Revalidate data after deleting all tags
  mutate("/api/GetTags");
  // Also revalidate the DataTables data
  mutate("/api/GetTagDataTables");
};

export const DataInDataTables = () => {
  const { data, error } = useSWR<TagDataInDataTables[]>("/api/GetTags", fetcher);

  if (error)
    return (
      <div className="items-center justify-center flex text-4xl font-bold text-red-500">
        Failed to load data
      </div>
    );
  if (!data)
    return (
      <div className="items-center justify-center flex">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="md:px-32 px-8 flex flex-col items-center p-4 ">
      <div className="items-center justify-center flex font-bold text-2xl m-4">
        Data In Datatables
      </div>
      
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center">
          <Table className="text-center">
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-center">#</TableHead>
                {/* <TableHead className="font-bold text-center">TagID</TableHead> */}
                <TableHead className="font-bold text-center">Part#</TableHead>
                <TableHead className="font-bold text-center">P.O.</TableHead>
                <TableHead className="font-bold text-center">Quantity</TableHead>
                <TableHead className="font-bold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((tag, index) => (
                <TableRow key={tag.tag_id}>
                  <TableCell className="font-bold">{index + 1}</TableCell>
                  {/* <TableCell>
                    {tag.tag_id ? (
                      tag.tag_id
                    ) : (
                      <span className="text-red-500 font-semibold">N/A</span>
                    )}
                  </TableCell> */}
                  <TableCell>
                    {tag.part_no ? (
                      tag.part_no
                    ) : (
                      <span className="text-red-500 font-semibold">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {tag.po ? (
                      tag.po
                    ) : (
                      <span className="text-red-500 font-semibold">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {tag.quantity !== null ? (
                      tag.quantity
                    ) : (
                      <span className="text-red-500 font-semibold">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      className="bg-red-500 hover:bg-red-900 text-white"
                      onClick={() => deleteTagByTagId(tag.tag_id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-start w-full mt-4 mb-16">
        <Button
          className="bg-red-600 hover:bg-red-900 text-white"
          onClick={deleteAllTags}
        >
          ⚠️ Delete All Data ⚠️
        </Button>
      </div>
    </div>
  );
};
