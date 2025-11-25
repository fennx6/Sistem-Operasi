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
  processes: Process[];
}

export function MemoryAllocationVisualizer({
  method,
  allocations,
  waiting,
  partitions,
  processes,
}: MemoryAllocationVisualizerProps) {
  const getProcessInPartition = (partitionId: string) => {
    return allocations.find(a => a.partition.id === partitionId);
  };

  const totalFragmentation = allocations.reduce((sum, a) => sum + a.internalFragmentation, 0);
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
            {partitions.map((partition, _index) => {
              const allocation = getProcessInPartition(partition.id);
              return (
                <div key={partition.id} className="space-y-1">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-12 sm:w-16 text-right text-gray-600 text-xs sm:text-sm">
                      {partition.size} MB
                    </div>
                    <div className="flex-1 h-10 sm:h-12 border-2 border-gray-300 rounded-lg overflow-hidden bg-white relative">
                      {allocation ? (
                        <>
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white relative text-xs sm:text-sm"
                            style={{
                              width: `${(allocation.process.size / partition.size) * 100}%`,
                            }}
                          >
                            <span className="z-10">{allocation.process.name}</span>
                          </div>
                          {allocation.internalFragmentation > 0 && (
                            <div
                              className="absolute top-0 right-0 h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs"
                              style={{
                                width: `${(allocation.internalFragmentation / partition.size) * 100}%`,
                              }}
                            >
                              <span className="hidden sm:inline">{allocation.internalFragmentation} MB</span>
                              <span className="sm:hidden">{allocation.internalFragmentation}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs sm:text-sm">
                          Kosong
                        </div>
                      )}
                    </div>
                    <div className="w-16 sm:w-24">
                      {allocation && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-xs">
                          {allocation.process.size} MB
                        </Badge>
                      )}
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
                      <TableHead className="text-xs sm:text-sm">Partisi</TableHead>
                      <TableHead className="text-xs sm:text-sm">Fragmentasi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocations.map((allocation, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-xs sm:text-sm">{allocation.process.name}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{allocation.process.size} MB</TableCell>
                        <TableCell className="text-xs sm:text-sm">{allocation.partition.size} MB</TableCell>
                        <TableCell className="text-orange-600 text-xs sm:text-sm">
                          {allocation.internalFragmentation} MB
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
                          <TableCell className="text-xs sm:text-sm">{process.size} MB</TableCell>
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
              <div className="text-gray-600 mb-1 text-xs sm:text-sm">Fragmentasi Internal</div>
              <div className="text-xl sm:text-2xl text-orange-600">{totalFragmentation} MB</div>
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