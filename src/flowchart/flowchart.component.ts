import { Component, ElementRef, HostListener, ViewChild, ViewContainerRef } from '@angular/core';
import { FlowchartRendererService } from './services/flowchart-renderer.service';
import { FlowchartStep } from './types/flowchart-step.type';
import { NgStyle } from '@angular/common';
import { DragService } from './services/flowchart-drag.service';
import { FlowchartStepsEnum } from './enums/flowchart-steps.enum';
import { FlowchartService } from './services/flowchart.service';

@Component({
  standalone: true,
  imports: [NgStyle],
  selector: 'flowchart',
  styleUrl: './flowchart.component.scss',
  templateUrl: './flowchart.component.html',
})
export class FlowchartComponent {
  @ViewChild('container', { read: ViewContainerRef })
  private viewContainerRef!: ViewContainerRef;
  @ViewChild('svg')
  private svgRef!: ElementRef<SVGElement>;

  public canvasWidth = 0;
  public canvasHeight = 0;

  constructor(
    private flowchartService: FlowchartService,
    private r: FlowchartRendererService,
    private dragService: DragService,
    private elementRef: ElementRef
  ) {}

  ngAfterViewInit() {
    this.flowchartService.initFlowchart(this.viewContainerRef, this.elementRef, this.svgRef);

    this.flowchartService.initSteps(mock);
  }

  @HostListener('dragover', ['$event'])
  private onDragOver(e: DragEvent) {
    e.preventDefault();
    this.dragService.onFlowchartDragOver(e);
  }

  @HostListener('dblclick', ['$event']) dblClick(e: MouseEvent) {
    const { x, y } = this.r.getPointXYRelativeToFlowchart({
      x: e.clientX,
      y: e.clientY,
    });

    console.log('x :>> ', x);
    console.log('y :>> ', y);
  }

  logFlow() {
    console.log(this.r.flow);
  }
}

const mock: FlowchartStep = {
  type: FlowchartStepsEnum.STEP_INITIAL,
  data: {
    title: '1st component',
  },
  children: [
    {
      type: FlowchartStepsEnum.STEP_REQUEST,
      id: '1',
      children: [
        {
          type: FlowchartStepsEnum.STEP_SCRIPT,
        },
        {
          type: FlowchartStepsEnum.STEP_REQUEST,
          children: [
            {
              type: FlowchartStepsEnum.STEP_CONDITIONAL,
              children: [
                {
                  type: FlowchartStepsEnum.STEP_REQUEST,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
