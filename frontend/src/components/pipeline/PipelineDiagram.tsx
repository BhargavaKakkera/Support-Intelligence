'use client';

import { PipelineNode, PipelineNodeProps } from './PipelineNode';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PipelineDiagramProps {
  nodes: PipelineNodeProps[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  activeStage?: number; // 0 for none, 1-6 for active
}

export function PipelineDiagram({ 
  nodes, 
  orientation = 'horizontal',
  className,
  activeStage = 0
}: PipelineDiagramProps) {
  return (
    <div className={cn(
      "flex",
      orientation === 'horizontal' ? "flex-row items-stretch" : "flex-col items-center",
      className
    )}>
      {nodes.map((node, index) => (
        <div 
          key={index} 
          className={cn(
            "flex",
            orientation === 'horizontal' ? "flex-row items-center flex-1" : "flex-col items-center w-full max-w-md"
          )}
        >
          <div className={cn(
            "flex-1 w-full",
            orientation === 'vertical' && "my-2"
          )}>
            <PipelineNode {...node} />
          </div>
          
          {index < nodes.length - 1 && (
            <div className={cn(
              "flex items-center justify-center shrink-0",
              orientation === 'horizontal' ? "mx-2 w-8" : "my-2 h-8"
            )}>
              {orientation === 'horizontal' ? (
                <ArrowRight className={cn(
                  "w-5 h-5",
                  activeStage > index + 1 ? "text-blue-500 animate-pulse" : "text-white/20"
                )} />
              ) : (
                <ArrowDown className={cn(
                  "w-5 h-5",
                  activeStage > index + 1 ? "text-blue-500 animate-pulse" : "text-white/20"
                )} />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
