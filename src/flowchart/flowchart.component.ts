import {
  Component,
  ElementRef,
  HostListener,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FlowchartRendererService } from './services/flowchart.service';
import { FlowchartConstantsEnum } from './helpers/flowchart-constants.enum';

@Component({
  standalone: true,
  selector: 'flowchart',
  styleUrl: './flowchart.component.scss',
  templateUrl: './flowchart.component.html',
})
export class FlowchartComponent {
  @ViewChild('container', { read: ViewContainerRef })
  private viewContainerRef!: ViewContainerRef;

  constructor(
    private flowchartRendererService: FlowchartRendererService,
    private elementRef: ElementRef<HTMLElement>,
    private renderer2: Renderer2
  ) {}

  ngOnInit() {
    this.renderer2.addClass(
      this.elementRef.nativeElement,
      FlowchartConstantsEnum.FLOWCHART_CLASS
    );
  }

  ngAfterViewInit() {
    this.flowchartRendererService.registerFlowchart(
      this.viewContainerRef,
      this.elementRef
    );

    this.flowchartRendererService.initFlowchart();
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
}
