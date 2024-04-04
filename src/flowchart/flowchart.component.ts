import { Component, ElementRef, HostListener, ViewChild, ViewContainerRef } from '@angular/core';
import { FlowchartRendererService } from './services/flowchart-renderer.service';
import { FlowchartStep } from './types/flowchart-step.type';
import { NgStyle } from '@angular/common';
import { FlowchartDragService } from './services/flowchart-drag.service';
import { FlowchartStepsEnum } from './enums/flowchart-steps.enum';
import { FlowchartService, flowB } from './services/flowchart.service';
import { FlowBlock } from './types/flow-block.type';
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
    private flowchartRendererService: FlowchartRendererService,
    private r: FlowchartRendererService,
    private dragService: FlowchartDragService,
    private elementRef: ElementRef<HTMLDivElement>
  ) {}

  ngOnInit() {
    this.elementRef.nativeElement.classList.add('animate-connectors');
  }

  ngAfterViewInit() {
    this.flowchartService.initFlowchart(this.viewContainerRef, this.elementRef, this.svgRef);

    const initialBlock = {
      blockId: 'initialExecutionBlock',
      type: FlowchartStepsEnum.STEP_INITIAL,
      nextBlocks: { success: flowB.initialExecutionBlock },
    };

    const step = this.buildFlowchartStepByFlowBlock(initialBlock as any);

    this.flowchartService.initSteps(step);
  }

  /**
   * Constroi um passo do flowchart baseado no bloco do fluxo do banco de dados
   * @param flowBlock
   */
  public buildFlowchartStepByFlowBlock(flowBlock: FlowBlock): FlowchartStep {
    if (!flowBlock) {
      return;
    }

    const flowchartStep = {
      id: flowBlock.blockId,
      type: flowBlock.type,
      data: {},
      children: [],
    };

    switch (flowBlock.type) {
      case FlowchartStepsEnum.STEP_REQUEST:
        Reflect.set(flowchartStep.data, 'requestId', flowBlock.requestId);
        Reflect.set(flowchartStep.data, 'shouldRegisterLog', flowBlock.shouldRegisterLog);
        Reflect.set(flowchartStep.data, 'quickLogTemplateSuccess', flowBlock.quickLogTemplateSuccess);
        Reflect.set(flowchartStep.data, 'quickLogTemplateError', flowBlock.quickLogTemplateError);
        break;
      case FlowchartStepsEnum.STEP_SCRIPT:
        Reflect.set(flowchartStep.data, 'scriptId', flowBlock.scriptId);
        break;
      case FlowchartStepsEnum.STEP_LOOP_START:
        Reflect.set(flowchartStep.data, 'valueToLoopPath', flowBlock.valueToLoopPath);
        break;
      case FlowchartStepsEnum.STEP_FLOW_REQUEST:
        Reflect.set(flowchartStep.data, 'flowEndpoint', flowBlock.flowEndpoint);
        break;
      case FlowchartStepsEnum.STEP_FINALIZATION:
        Reflect.set(flowchartStep.data, 'type', flowBlock.finalizationStatus);
        Reflect.set(flowchartStep.data, 'lastMessage', flowBlock.lastMessage);
        break;
      case FlowchartStepsEnum.STEP_EXECUTION_RETURN:
        Reflect.set(flowchartStep.data, 'type', flowBlock.type);
        Reflect.set(flowchartStep.data, 'lastMessage', flowBlock.lastMessage);
        Reflect.set(flowchartStep.data, 'executionReturnStatus', flowBlock.executionReturnStatus);
        Reflect.set(flowchartStep.data, 'expectedReturnLooseBody', flowBlock.expectedReturnLooseBody);
        Reflect.set(flowchartStep.data, 'expectedErrorReturnLooseBody', flowBlock.expectedErrorReturnLooseBody);
        break;
      case FlowchartStepsEnum.STEP_CONDITIONAL:
        Reflect.set(flowchartStep.data, 'conditionalType', flowBlock.conditionalType);
        Reflect.set(flowchartStep.data, 'conditionSimple', flowBlock.conditionSimple);
        if (flowBlock.conditionComposition) {
          for (let condition of flowBlock.conditionComposition) {
            condition.firstValue = condition.firstValue as string;
            condition.secondValue = condition.secondValue as string;
          }
        }
        Reflect.set(flowchartStep.data, 'conditionComposition', flowBlock.conditionComposition);
        break;
      case FlowchartStepsEnum.STEP_COLLECTION_REQUEST:
        Reflect.set(flowchartStep.data, 'requestType', flowBlock.collectionRequestType);
        Reflect.set(flowchartStep.data, 'collectionId', flowBlock.collectionId);
        Reflect.set(flowchartStep.data, 'collectionConfigurations', {
          id: flowBlock.collectionConfigurations?.id,
          body: flowBlock.collectionConfigurations?.body,
          query: flowBlock.collectionConfigurations?.query,
          limit: flowBlock.collectionConfigurations?.limit,
          sortDirection: flowBlock.collectionConfigurations?.sortDirection,
          sortColumn: flowBlock.collectionConfigurations?.sortColumn,
        });
        break;
      case FlowchartStepsEnum.STEP_NOTIFICATION:
        Reflect.set(flowchartStep.data, 'notificationList', flowBlock.notificationList);
        Reflect.set(flowchartStep.data, 'notificationMessage', flowBlock.notificationMessage);
        break;
    }

    // População de mapeamentos
    Reflect.set(flowchartStep.data, 'mappings', flowBlock.mappings);

    // População de blocos subsequentes
    if (flowBlock.nextBlocks.success) {
      flowchartStep.children.push(this.buildFlowchartStepByFlowBlock(flowBlock.nextBlocks.success));
    }

    if (flowBlock.nextBlocks.error) {
      flowchartStep.children.push(this.buildFlowchartStepByFlowBlock(flowBlock.nextBlocks.error));
    }

    return flowchartStep;
  }

  /**
   * Retorna um bloco novo
   * @param type
   * @param data
   */
  public createFlowchartStep(type?: FlowchartStepsEnum, data?: object): FlowchartStep {
    return {
      id: `s${new Date().getTime()}`,
      type: type,
      data: data ? data : {},
      children: [],
    };
  }

  @HostListener('dragover', ['$event'])
  private onDragOver(e: DragEvent) {
    e.preventDefault();
    this.dragService.onFlowchartDragOver(e);
  }

  @HostListener('dblclick', ['$event']) dblClick(e: MouseEvent) {
    const { x, y } = this.r.getPointXYRelativeToFlowchart(e.clientX, e.clientY);

    console.log('x :>> ', x);
    console.log('y :>> ', y);
  }

  logFlow() {
    console.log(this.r.flow);
  }

  recenter() {
    this.flowchartRendererService.render();
  }

  toggleDragMode() {
    this.flowchartRendererService.steps.forEach((step) => step.toggleDragMode());
  }

  clear() {
    localStorage.clear();
  }
}
