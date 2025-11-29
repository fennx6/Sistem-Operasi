import { Process, Partition, Allocation } from '../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface MemoryAllocationVisualizerProps {
  method: string;
  allocations: Allocation[];
  waiting: Process[];
  partitions: Partition[];
  resultPartitions: Partition[]; // Partisi hasil split
  processes: Process[];
}

export function MemoryAllocationVisualizer({
  method,
  allocations,
  waiting,
  partitions,
  resultPartitions,
  processes,
}: MemoryAllocationVisualizerProps) {
  // Cari alokasi untuk partisi tertentu
  const getAllocationForPartition = (partitionId: string) => {
    return allocations.find(a => a.partition.id === partitionId);
  };

  // Hitung fragmentasi eksternal (total ukuran partisi kosong)
  const calculateExternalFragmentation = () => {
    let totalFree = 0;
    resultPartitions.forEach(partition => {
      const alloc = getAllocationForPartition(partition.id);
      if (!alloc) {
        totalFree += partition.size;
      }
    });
    return totalFree;
  };

  const externalFragmentation = calculateExternalFragmentation();
  const allocationRate = processes.length > 0 
    ? ((allocations.length / processes.length) * 100).toFixed(1) 
    : 0;

  return (
    <div className="space-y-4 sm:space-y-6 py-4">
      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl text-blue-600 mb-1">{allocations.length}</div>
              <div className="text-gray-600 text-xs sm:text-sm">Proses Teralokasi</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl text-orange-600 mb-1">{waiting.length}</div>
              <div className="text-gray-600 text-xs sm:text-sm">Proses Menunggu</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl text-green-600 mb-1">{allocationRate}%</div>
              <div className="text-gray-600 text-xs sm:text-sm">Tingkat Alokasi</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Memory Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Visualisasi Memori</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Peta alokasi memori dengan metode {method}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {resultPartitions.map((partition, index) => {
              const allocation = getAllocationForPartition(partition.id);
              const isAllocated = !!allocation;
              
              // Untuk yang dialokasi: tampilkan ukuran ASLI
              // Untuk yang kosong (hasil split): tampilkan ukuran sisa
              const displaySize = isAllocated 
                ? (partition.originalSize || partition.size) 
                : partition.size;
              
              return (
                <div key={partition.id} className="space-y-1">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-12 sm:w-16 text-right text-gray-600 text-xs sm:text-sm">
                      {displaySize}
                    </div>
                    <div className="flex-1 h-10 sm:h-12 border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                      {isAllocated ? (
                        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs sm:text-sm">
                          <span className="z-10 truncate px-1">{allocation.process.name}</span>
                        </div>
                      ) : (
                        <div className="h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs sm:text-sm">
                          Kosong
                        </div>
                      )}
                    </div>
                    <div className="w-12 sm:w-16 text-left text-gray-600 text-xs sm:text-sm">
                      {isAllocated ? allocation.process.size : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Allocation Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              Proses Teralokasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Proses</TableHead>
                      <TableHead className="text-xs sm:text-sm">Ukuran</TableHead>
                      <TableHead className="text-xs sm:text-sm">Partisi Asal</TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocations.map((allocation, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-xs sm:text-sm">{allocation.process.name}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{allocation.process.size} KB</TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          Partisi {allocation.partition.originalIndex + 1}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                            Allocated
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            {allocations.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-xs sm:text-sm">
                Tidak ada proses yang teralokasi
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              Proses Menunggu
            </CardTitle>
          </CardHeader>
          <CardContent>
            {waiting.length > 0 ? (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Proses</TableHead>
                        <TableHead className="text-xs sm:text-sm">Ukuran</TableHead>
                        <TableHead className="text-xs sm:text-sm">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {waiting.map((process, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-xs sm:text-sm">{process.name}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{process.size} KB</TableCell>
                          <TableCell>
                            <Badge variant="destructive" className="text-xs">Waiting</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-green-600">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2" />
                <p className="text-xs sm:text-sm">Semua proses berhasil dialokasikan!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Ringkasan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <div className="text-gray-600 mb-1 text-xs sm:text-sm">Total Partisi</div>
              <div className="text-xl sm:text-2xl">{partitions.length}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1 text-xs sm:text-sm">Total Proses</div>
              <div className="text-xl sm:text-2xl">{processes.length}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1 text-xs sm:text-sm">Fragmentasi Eksternal</div>
              <div className="text-xl sm:text-2xl text-orange-600">{externalFragmentation} KB</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1 text-xs sm:text-sm">Efisiensi</div>
              <div className="text-xl sm:text-2xl text-green-600">{allocationRate}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}