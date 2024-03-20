import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FlowchartService } from './services/flowchart.service';
import { FlowchartStep } from './types/flowchart-step.type';
import { NgStyle } from '@angular/common';
import { ConnectorsService } from './services/flowchart-connectors.service';
import { DragService } from './services/flowchart-drag.service';
import { FlowchartStepsService } from './services/flowchart-steps.service';
import { FlowchartStepsEnum } from './enums/flowchart-steps.enum';

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
    private flowchartStepsService: FlowchartStepsService,
    private connectorsService: ConnectorsService,
    private dragService: DragService,
    private elementRef: ElementRef
  ) {}

  ngAfterViewInit() {
    this.connectorsService.registerSvg(this.svgRef.nativeElement);
    this.flowchartService.registerFlowchart(
      this.viewContainerRef,
      this.elementRef,
      this.svgRef
    );
    this.flowchartStepsService.registerFlowchart(
      this.viewContainerRef,
      this.elementRef
    );

    this.flowchartStepsService.createStep({ pendingStep: mock });
  }

  @HostListener('window:resize', ['$event']) onResize(event: Event) {
    this.flowchartService.reCenterFlow();
  }

  @HostListener('dragover', ['$event'])
  private onDragOver(e: DragEvent) {
    e.preventDefault();
    this.dragService.onFlowchartDragOver(e);
  }

  @HostListener('dblclick', ['$event']) dblClick(e: MouseEvent) {
    const { x, y } = this.flowchartService.getPointXYRelativeToFlowchart({
      x: e.clientX,
      y: e.clientY,
    });

    console.log('x :>> ', x);
    console.log('y :>> ', y);
  }

  logFlow() {
    console.log(this.flowchartService.flow);
  }
}

const mock: FlowchartStep = {
  type: FlowchartStepsEnum.STEP_INITIAL,
  data: {
    title: '1st component',
  },
  children: [
    {
      type: FlowchartStepsEnum.STEP_SCRIPT,
      children: [
        {
          type: FlowchartStepsEnum.STEP_RESULT,
        },
      ],
    },
  ],
};
