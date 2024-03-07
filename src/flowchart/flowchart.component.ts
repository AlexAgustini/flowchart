import {
  Component,
  ElementRef,
  HostListener,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FlowchartService } from './services/flowchart.service';
import { FlowchartConstants } from './helpers/flowchart-constants.enum';
import { FlowchartStep } from './types/flowchart-step.type';
import { NgStyle } from '@angular/common';
import { ConnectorsService } from './services/connectors.service';

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
    private flowchartRendererService: FlowchartService,
    private connectorsService: ConnectorsService,
    private renderer2: Renderer2,
    private elementRef: ElementRef
  ) {}

  getViewbox() {
    return `0 0 ${this.canvasWidth} ${this.canvasHeight}`;
  }

  ngOnInit() {
    this.resizeCanvas();
  }

  ngAfterViewInit() {
    this.connectorsService.registerSvg(this.svgRef.nativeElement);
    this.flowchartRendererService.registerFlowchart(
      this.viewContainerRef,
      this.elementRef
    );
    this.flowchartRendererService.initFlowchart(mock);
  }

  @HostListener('dblclick', ['$event']) dblClick(e: MouseEvent) {
    const { x, y } =
      this.flowchartRendererService.getPointXYRelativeToFlowchart({
        x: e.clientX,
        y: e.clientY,
      });
    console.log('e.x :>> ', x);
    console.log('e.y :>> ', y);
  }

  logFlow() {
    console.log(this.flowchartRendererService.flow);
  }

  resizeCanvas() {
    setInterval(() => {
      this.canvasHeight = this.elementRef.nativeElement?.scrollHeight;
      this.canvasWidth = this.elementRef.nativeElement?.scrollWidth;

      const boundaries = document.querySelectorAll(
        '.cdk-drag-boundary-container'
      );

      // console.log(boundaries);

      // boundaries.forEach((el: HTMLDivElement) => {
      //   const elTop = Number(el.style.top.replace(/\D/g, '')) || 0;
      //   const elHeight = this.canvasHeight - elTop;

      //   console.log(elTop);
      //   console.log(elHeight);

      //   el.style.height = `${elHeight}px`;
      // });
    }, 500);
  }
}

const mock: FlowchartStep = {
  STEP_NAME: 'BLOCK_1',
  data: {
    title: '1st component',
  },
  coordinates: {
    x: 600,
    y: 150,
  },
  children: [
    {
      STEP_NAME: 'STEP_RESULT',
      coordinates: {
        x: 300,
        y: 230,
      },
    },
  ],
};
