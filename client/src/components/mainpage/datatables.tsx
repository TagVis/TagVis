import useSWR from "swr";
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

interface TagDataTables {
  tag_id: number;
  part_no: string | null;
  po: string | null;
  quantity: number | null;
}

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((res) => res.json());

export const DataTables = () => {
  const { data, error } = useSWR<TagDataTables[]>(
    "http://localhost:8340/GetTagDataTables",
    fetcher
  );

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

  const partSum = data.reduce<Record<string, number>>((acc, tag) => {
    const partKey = tag.part_no || "N/A";
    acc[partKey] = (acc[partKey] || 0) + (tag.quantity || 0);
    return acc;
  }, {});

  return (
    <div className="md:px-32 px-8">
      <div className="items-center justify-center flex font-bold text-2xl m-4">
        Datatables
      </div>
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center">
          <Table className="text-center">
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-center">Part#</TableHead>
                <TableHead className="font-bold text-center">P.O.</TableHead>
                <TableHead className="font-bold text-center">Quantity</TableHead>
                <TableHead className="font-bold text-center">Sum of Part#</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((tag) => (
                <TableRow key={tag.tag_id}>
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
                    <span
                      className={
                        tag.part_no === null
                          ? "text-orange-500"
                          : ""
                      }
                    >
                      {partSum[tag.part_no || "N/A"]}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
