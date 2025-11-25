import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Trash2, Plus } from 'lucide-react';
import { Process } from '../App';

interface ProcessInputFormProps {
  processes: Process[];
  onAddProcess: (name: string, size: number) => void;
  onRemoveProcess: (id: string) => void;
}

export function ProcessInputForm({ processes, onAddProcess, onRemoveProcess }: ProcessInputFormProps) {
  const [processName, setProcessName] = useState('');
  const [processSize, setProcessSize] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (processName && processSize && Number(processSize) > 0) {
      onAddProcess(processName, Number(processSize));
      setProcessName('');
      setProcessSize('');
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Proses</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Tambahkan proses yang akan dialokasikan</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="process-name" className="text-xs sm:text-sm">Nama Proses</Label>
              <Input
                id="process-name"
                placeholder="P1"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="process-size" className="text-xs sm:text-sm">Ukuran (MB)</Label>
              <Input
                id="process-size"
                type="number"
                placeholder="312"
                value={processSize}
                onChange={(e) => setProcessSize(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          <Button type="submit" className="w-full text-xs sm:text-sm">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Tambah Proses
          </Button>
        </form>

        <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
          {processes.map((process) => (
            <div
              key={process.id}
              className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="text-xs sm:text-sm">
                <span className="mr-2 sm:mr-4 font-medium">{process.name}</span>
                <span className="text-gray-600">{process.size} MB</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveProcess(process.id)}
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