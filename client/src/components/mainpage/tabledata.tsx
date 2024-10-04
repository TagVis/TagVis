import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const TableData = () => {
  return (
    <div className="md:px-32 px-8">
      <Card className="w-full">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part#</TableHead>
                <TableHead>P.O.</TableHead>
                <TableHead>Quntity</TableHead>
                <TableHead>Sum of Part#</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>ABC</TableCell>
                <TableCell>123456</TableCell>
                <TableCell>5</TableCell>
                <TableCell>50000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>ABC</TableCell>
                <TableCell>123456</TableCell>
                <TableCell>5</TableCell>
                <TableCell>50000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>ABC</TableCell>
                <TableCell>123456</TableCell>
                <TableCell>5</TableCell>
                <TableCell>50000</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
