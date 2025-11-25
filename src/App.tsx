import { useState, useMemo } from "react";
import { ProcessInputForm } from "./components/ProcessInputForm";
import { PartitionInputForm } from "./components/PartitionInputForm";
import { MemoryAllocationVisualizer } from "./components/MemoryAllocationVisualizer";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";

export interface Process {
  id: string;
  name: string;
  size: number;
}

export interface Partition {
  id: string;
  size: number;
  originalIndex: number;
}

export interface Allocation {
  process: Process;
  partition: Partition;
  internalFragmentation: number;
}

export default function App() {
  const [processes, setProcesses] = useState<Process[]>([]);

  const [partitions, setPartitions] = useState<Partition[]>([]);

  const addProcess = (name: string, size: number) => {
    const newProcess: Process = {
      id: Date.now().toString(),
      name,
      size,
    };
    setProcesses([...processes, newProcess]);
  };

  const removeProcess = (id: string) => {
    setProcesses(processes.filter((p) => p.id !== id));
  };

  const addPartition = (size: number) => {
    const newPartition: Partition = {
      id: Date.now().toString(),
      size,
      originalIndex: partitions.length,
    };
    setPartitions([...partitions, newPartition]);
  };

  const removePartition = (id: string) => {
    setPartitions(partitions.filter((p) => p.id !== id));
  };

  // -------------------------
  // ALGORTIMA SUDAH DIPERBAIKI
  // -------------------------

  const firstFit = () => {
    const allocations: Allocation[] = [];
    const waiting: Process[] = [];

    const available = partitions.map((p) => ({
      ...p,
      allocated: false,
    }));

    processes.forEach((process) => {
      let allocated = false;

      for (let i = 0; i < available.length; i++) {
        const part = available[i];
        if (!part.allocated && part.size >= process.size) {
          allocations.push({
            process,
            partition: part,
            internalFragmentation: part.size - process.size,
          });
          part.allocated = true;
          allocated = true;
          break;
        }
      }

      if (!allocated) waiting.push(process);
    });

    return { allocations, waiting };
  };

  const bestFit = () => {
    const allocations: Allocation[] = [];
    const waiting: Process[] = [];
    const available = partitions.map((p) => ({
      ...p,
      allocated: false,
    }));

    processes.forEach((process) => {
      let bestIndex = -1;
      let bestSize = Infinity;

      available.forEach((part, idx) => {
        if (!part.allocated && part.size >= process.size) {
          if (part.size < bestSize) {
            bestSize = part.size;
            bestIndex = idx;
          }
        }
      });

      if (bestIndex !== -1) {
        const part = available[bestIndex];
        allocations.push({
          process,
          partition: part,
          internalFragmentation: part.size - process.size,
        });
        part.allocated = true;
      } else {
        waiting.push(process);
      }
    });

    return { allocations, waiting };
  };

  const worstFit = () => {
    const allocations: Allocation[] = [];
    const waiting: Process[] = [];
    const available = partitions.map((p) => ({
      ...p,
      allocated: false,
    }));

    processes.forEach((process) => {
      let worstIndex = -1;
      let worstSize = -1;

      available.forEach((part, idx) => {
        if (!part.allocated && part.size >= process.size) {
          if (part.size > worstSize) {
            worstSize = part.size;
            worstIndex = idx;
          }
        }
      });

      if (worstIndex !== -1) {
        const part = available[worstIndex];
        allocations.push({
          process,
          partition: part,
          internalFragmentation: part.size - process.size,
        });
        part.allocated = true;
      } else {
        waiting.push(process);
      }
    });

    return { allocations, waiting };
  };

  // -------------------------
  // HITUNG SEKALI SAJA (useMemo)
  // -------------------------
  const ff = useMemo(firstFit, [processes, partitions]);
  const bf = useMemo(bestFit, [processes, partitions]);
  const wf = useMemo(worstFit, [processes, partitions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-blue-900 mb-2 text-2xl sm:text-3xl lg:text-4xl">
            Simulator Alokasi Memori Kontigu
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Simulasi algoritma First-Fit, Best-Fit, dan
            Worst-Fit
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <ProcessInputForm
            processes={processes}
            onAddProcess={addProcess}
            onRemoveProcess={removeProcess}
          />
          <PartitionInputForm
            partitions={partitions}
            onAddPartition={addPartition}
            onRemovePartition={removePartition}
          />
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Hasil Alokasi Memori</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Visualisasi dan perbandingan hasil metode alokasi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="first-fit" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="first-fit" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
                  First-Fit
                </TabsTrigger>
                <TabsTrigger value="best-fit" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
                  Best-Fit
                </TabsTrigger>
                <TabsTrigger value="worst-fit" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
                  Worst-Fit
                </TabsTrigger>
              </TabsList>

              <TabsContent value="first-fit">
                <MemoryAllocationVisualizer
                  method="First-Fit"
                  allocations={ff.allocations}
                  waiting={ff.waiting}
                  partitions={partitions}
                  processes={processes}
                />
              </TabsContent>

              <TabsContent value="best-fit">
                <MemoryAllocationVisualizer
                  method="Best-Fit"
                  allocations={bf.allocations}
                  waiting={bf.waiting}
                  partitions={partitions}
                  processes={processes}
                />
              </TabsContent>

              <TabsContent value="worst-fit">
                <MemoryAllocationVisualizer
                  method="Worst-Fit"
                  allocations={wf.allocations}
                  waiting={wf.waiting}
                  partitions={partitions}
                  processes={processes}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}