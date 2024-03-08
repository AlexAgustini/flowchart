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
import { FlowchartCanvasService } from './services/flowchart-canvas.service';
import { FlowBlocksEnum } from './helpers/flowchart-steps-registry';

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
    private flowchartCanvasService: FlowchartCanvasService,
    private connectorsService: ConnectorsService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.resizeCanvas();
  }

  ngAfterViewInit() {
    this.connectorsService.registerSvg(this.svgRef.nativeElement);
    this.flowchartCanvasService.registerFlowchart(
      this.viewContainerRef,
      this.elementRef
    );

    this.flowchartCanvasService.initFlowchart(mock);
  }

  getViewbox() {
    return `0 0 ${this.canvasWidth} ${this.canvasHeight}`;
  }

  logFlow() {
    console.log(this.flowchartService.flow);
  }

  resizeCanvas() {
    setInterval(() => {
      this.canvasHeight = this.elementRef.nativeElement?.scrollHeight;
      this.canvasWidth = this.elementRef.nativeElement?.scrollWidth;
    }, 500);
  }

  @HostListener('dblclick', ['$event']) dblClick(e: MouseEvent) {
    const { x, y } = this.flowchartCanvasService.getPointXYRelativeToFlowchart({
      x: e.clientX,
      y: e.clientY,
    });

    console.log(x);
    console.log(y);
  }

  @HostListener('dragover', ['$event'])
  private onDragOver(e) {
    e.preventDefault();
  }
}

const mock: FlowchartStep = {
  id: '1',
  type: FlowBlocksEnum.INITIAL_STEP,
  data: {
    title: '1st component',
  },
  children: [
    {
      id: '2',
      type: FlowBlocksEnum.STEP_RESULT,
      children: [
        {
          id: '3',
          type: FlowBlocksEnum.BLOCK_1,
        },
      ],
    },
  ],
};
