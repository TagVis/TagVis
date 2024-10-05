import useSWR from 'swr';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingSpinner } from '../loadingspinner/loadingspinner';

interface Tag {
  tag_id: number;
  part_no: string | null;
  po: string | null;
  quantity: number | null;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const TableData = () => {
  const { data, error } = useSWR<Tag[]>('/api/GetTagTableData', fetcher);

  if (error) return <div>Failed to load data</div>;
  if (!data) return <div className='items-center justify-center flex'><LoadingSpinner /></div>;

  const partSum = data.reduce<Record<string, number>>((acc, tag) => {
    if (tag.part_no) {
      acc[tag.part_no] = (acc[tag.part_no] || 0) + (tag.quantity || 0);
    }
    return acc;
  }, {});

  return (
    <div className="md:px-32 px-8">
      <Card className="w-full">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='font-bold'>Part#</TableHead>
                <TableHead className='font-bold'>P.O.</TableHead>
                <TableHead className='font-bold'>Quantity</TableHead>
                <TableHead className='font-bold'>Sum of Part#</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((tag) => (
                <TableRow key={tag.tag_id}>
                  <TableCell>
                    {tag.part_no ? tag.part_no : <span className="text-red-500 font-semibold">N/A</span>}
                  </TableCell>
                  <TableCell>
                    {tag.po ? tag.po : <span className="text-red-500 font-semibold">N/A</span>}
                  </TableCell>
                  <TableCell>
                    {tag.quantity !== null ? tag.quantity : <span className="text-red-500 font-semibold">N/A</span>}
                  </TableCell>
                  <TableCell>
                    {tag.part_no && partSum[tag.part_no] !== undefined ? partSum[tag.part_no] : <span className="text-red-500 font-semibold">Missing Part#</span>}
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
