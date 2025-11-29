import { useState, useMemo, useEffect } from "react";
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
  parentId?: string;
  originalSize?: number;
}

export interface Allocation {
  process: Process;
  partition: Partition;
  internalFragmentation: number;
}

export interface AllocationResult {
  allocations: Allocation[];
  waiting: Process[];
  resultPartitions: Partition[];
}

export default function App() {
  const [processes, setProcesses] = useState<Process[]>(() => {
    const saved = localStorage.getItem("processes");
    return saved ? JSON.parse(saved) : [];
  });

  const [partitions, setPartitions] = useState<Partition[]>(() => {
    const saved = localStorage.getItem("partitions");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("processes", JSON.stringify(processes));
  }, [processes]);

  useEffect(() => {
    localStorage.setItem("partitions", JSON.stringify(partitions));
  }, [partitions]);


  // FUNGSI PROCESS // 
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


  // ================================
  // FUNGSI PARTITION
  // ================================
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


  // ================================
  // FIRST FIT
  // ================================
  const firstFit = (): AllocationResult => {
    const allocations: Allocation[] = [];
    const waiting: Process[] = [];
    const resultPartitions: Partition[] = [];
    let availablePartitions = [...partitions];

    processes.forEach((process) => {
      let allocated = false;

      for (let i = 0; i < availablePartitions.length; i++) {
        const part = availablePartitions[i];
        if (part.size >= process.size) {
          const allocatedPartition: Partition = {
            ...part,
            size: process.size,
            id: `${part.id}-alloc-${Date.now()}`,
            originalSize: part.originalSize || part.size,
          };

          allocations.push({
            process,
            partition: allocatedPartition,
            internalFragmentation: 0,
          });

          const remainingSize = part.size - process.size;
          if (remainingSize > 0) {
            availablePartitions[i] = {
              id: `${part.id}-split-${Date.now()}`,
              size: remainingSize,
              originalIndex: part.originalIndex,
              parentId: part.id,
            };
          } else {
            availablePartitions.splice(i, 1);
          }

          allocated = true;
          break;
        }
      }

      if (!allocated) waiting.push(process);
    });

    partitions.forEach(originalPartition => {
      const relatedAllocs = allocations.filter(
        a => a.partition.originalIndex === originalPartition.originalIndex
      );
      const relatedRemaining = availablePartitions.find(
        p => p.originalIndex === originalPartition.originalIndex
      );

      relatedAllocs.forEach(alloc => resultPartitions.push(alloc.partition));
      if (relatedRemaining) resultPartitions.push(relatedRemaining);
    });

    return { allocations, waiting, resultPartitions };
  };


  // ================================
  // BEST FIT
  // ================================
  const bestFit = (): AllocationResult => {
    const allocations: Allocation[] = [];
    const waiting: Process[] = [];
    const resultPartitions: Partition[] = [];
    let availablePartitions = [...partitions];

    processes.forEach((process) => {
      let bestIndex = -1;
      let bestSize = Infinity;

      availablePartitions.forEach((part, idx) => {
        if (part.size >= process.size && part.size < bestSize) {
          bestSize = part.size;
          bestIndex = idx;
        }
      });

      if (bestIndex !== -1) {
        const part = availablePartitions[bestIndex];
        const allocatedPartition: Partition = {
          ...part,
          size: process.size,
          id: `${part.id}-alloc-${Date.now()}`,
          originalSize: part.originalSize || part.size,
        };

        allocations.push({
          process,
          partition: allocatedPartition,
          internalFragmentation: 0,
        });

        const remainingSize = part.size - process.size;
        if (remainingSize > 0) {
          availablePartitions[bestIndex] = {
            id: `${part.id}-split-${Date.now()}`,
            size: remainingSize,
            originalIndex: part.originalIndex,
            parentId: part.id,
          };
        } else {
          availablePartitions.splice(bestIndex, 1);
        }
      } else {
        waiting.push(process);
      }
    });

    partitions.forEach(originalPartition => {
      const relatedAllocs = allocations.filter(
        a => a.partition.originalIndex === originalPartition.originalIndex
      );
      const relatedRemaining = availablePartitions.find(
        p => p.originalIndex === originalPartition.originalIndex
      );

      relatedAllocs.forEach(alloc => resultPartitions.push(alloc.partition));
      if (relatedRemaining) resultPartitions.push(relatedRemaining);
    });

    return { allocations, waiting, resultPartitions };
  };


  // ================================
  // WORST FIT
  // ================================
  const worstFit = (): AllocationResult => {
    const allocations: Allocation[] = [];
    const waiting: Process[] = [];
    const resultPartitions: Partition[] = [];
    let availablePartitions = [...partitions];

    processes.forEach((process) => {
      let worstIndex = -1;
      let worstSize = -1;

      availablePartitions.forEach((part, idx) => {
        if (part.size >= process.size && part.size > worstSize) {
          worstSize = part.size;
          worstIndex = idx;
        }
      });

      if (worstIndex !== -1) {
        const part = availablePartitions[worstIndex];
        const allocatedPartition: Partition = {
          ...part,
          size: process.size,
          id: `${part.id}-alloc-${Date.now()}`,
          originalSize: part.originalSize || part.size,
        };

        allocations.push({
          process,
          partition: allocatedPartition,
          internalFragmentation: 0,
        });

        const remainingSize = part.size - process.size;
        if (remainingSize > 0) {
          availablePartitions[worstIndex] = {
            id: `${part.id}-split-${Date.now()}`,
            size: remainingSize,
            originalIndex: part.originalIndex,
            parentId: part.id,
          };
        } else {
          availablePartitions.splice(worstIndex, 1);
        }
      } else {
        waiting.push(process);
      }
    });

    partitions.forEach(originalPartition => {
      const relatedAllocs = allocations.filter(
        a => a.partition.originalIndex === originalPartition.originalIndex
      );
      const relatedRemaining = availablePartitions.find(
        p => p.originalIndex === originalPartition.originalIndex
      );

      relatedAllocs.forEach(alloc => resultPartitions.push(alloc.partition));
      if (relatedRemaining) resultPartitions.push(relatedRemaining);
    });

    return { allocations, waiting, resultPartitions };
  };

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
            Simulasi algoritma First-Fit, Best-Fit, dan Worst-Fit
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
                <TabsTrigger value="first-fit">First-Fit</TabsTrigger>
                <TabsTrigger value="best-fit">Best-Fit</TabsTrigger>
                <TabsTrigger value="worst-fit">Worst-Fit</TabsTrigger>
              </TabsList>

              <TabsContent value="first-fit">
                <MemoryAllocationVisualizer
                  method="First-Fit"
                  allocations={ff.allocations}
                  waiting={ff.waiting}
                  partitions={partitions}
                  resultPartitions={ff.resultPartitions}
                  processes={processes}
                />
              </TabsContent>

              <TabsContent value="best-fit">
                <MemoryAllocationVisualizer
                  method="Best-Fit"
                  allocations={bf.allocations}
                  waiting={bf.waiting}
                  partitions={partitions}
                  resultPartitions={bf.resultPartitions}
                  processes={processes}
                />
              </TabsContent>

              <TabsContent value="worst-fit">
                <MemoryAllocationVisualizer
                  method="Worst-Fit"
                  allocations={wf.allocations}
                  waiting={wf.waiting}
                  partitions={partitions}
                  resultPartitions={wf.resultPartitions}
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
