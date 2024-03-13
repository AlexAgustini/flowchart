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
import { ConnectorsService } from './services/connectors.service';
import { FlowBlocksEnum } from './helpers/flowchart-steps-registry';
import { DragService } from './services/drag.service';
import { FlowchartStepsService } from './services/flowchart-steps.service';
import { FlowchartStepComponent } from './components/flowchart-step-component/flowchart-step.component';

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

  ngOnInit() {
    setInterval(() => {
      this.redrawAllConnectors();
    }, 500);
  }

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
    this.redrawAllConnectors();
    this.reCenterFlow();
  }

  @HostListener('dragover', ['$event'])
  private onDragOver(e: DragEvent) {
    e.preventDefault();
    this.dragService.onFlowchartDragOver(e);
  }

  @HostListener('dragend', ['$event'])
  private onDragEnd(e: DragEvent) {
    e.preventDefault();
    this.dragService.onFlowchartDragEnd(e);
  }

  @HostListener('drop', ['$event'])
  private onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragService.onFlowchartDrop(e);
  }

  public reCenterFlow() {
    this.flowchartService.reCenterFlow();
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

  private redrawAllConnectors() {
    this.flowchartService.flow.steps.forEach((step) => {
      step.redrawConnectorsTree();
    });
  }
}

const mock: FlowchartStep = {
  type: FlowBlocksEnum.INITIAL_STEP,
  data: {
    title: '1st component',
  },
  children: [
    {
      type: FlowBlocksEnum.STEP_RESULT,
      children: [
        {
          type: FlowBlocksEnum.DROP_AREA,
        },
      ],
    },
  ],
};
