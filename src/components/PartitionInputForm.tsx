import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Trash2, Plus } from 'lucide-react';
import { Partition } from '../App';

interface PartitionInputFormProps {
  partitions: Partition[];
  onAddPartition: (size: number) => void;
  onRemovePartition: (id: string) => void;
}

export function PartitionInputForm({ partitions, onAddPartition, onRemovePartition }: PartitionInputFormProps) {
  const [partitionSize, setPartitionSize] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (partitionSize && Number(partitionSize) > 0) {
      onAddPartition(Number(partitionSize));
      setPartitionSize('');
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Partisi Memori</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Tambahkan partisi memori yang tersedia</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mb-4">
          <div>
            <Label htmlFor="partition-size" className="text-xs sm:text-sm">Ukuran Partisi (MB)</Label>
            <Input
              id="partition-size"
              type="number"
              placeholder="100"
              value={partitionSize}
              onChange={(e) => setPartitionSize(e.target.value)}
              className="text-sm"
            />
          </div>
          <Button type="submit" className="w-full text-xs sm:text-sm">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Tambah Partisi
          </Button>
        </form>

        <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
          {partitions.map((partition, index) => (
            <div
              key={partition.id}
              className="flex items-center justify-between p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200"
            >
              <div className="text-xs sm:text-sm">
                <span className="mr-2 sm:mr-4 font-medium">Partisi {index + 1}</span>
                <span className="text-gray-600">{partition.size} MB</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemovePartition(partition.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 sm:h-8 sm:w-8 p-0"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}