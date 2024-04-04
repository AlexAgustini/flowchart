import { ElementRef, Injectable, ViewContainerRef } from '@angular/core';
import { FlowchartStepsService } from './flowchart-steps.service';
import { FlowchartRendererService } from './flowchart-renderer.service';
import { FlowchartStep } from '../types/flowchart-step.type';
import { FlowchartConnectorsService } from './flowchart-connectors.service';

@Injectable({
  providedIn: 'root',
})
export class FlowchartService {
  /**
   * Serviço de steps
   */
  private readonly flowchartStepsService: FlowchartStepsService;
  /**
   * Serviço renderer do flow
   */
  private readonly flowchartRendererService: FlowchartRendererService;
  /**
   * Serviço de conectores
   */
  private readonly connectorsService: FlowchartConnectorsService;

  constructor(
    flowchartStepsService: FlowchartStepsService,
    flowchartRendererService: FlowchartRendererService,
    connectorsService: FlowchartConnectorsService
  ) {
    this.flowchartStepsService = flowchartStepsService;
    this.flowchartRendererService = flowchartRendererService;
    this.connectorsService = connectorsService;
  }

  /**
   * Inicia o flowchart
   * @param initialStep Step inicial
   */
  public async initSteps(initialStep: FlowchartStep): Promise<void> {
    await this.flowchartStepsService.createStep({ pendingStep: initialStep });
  }

  /**
   * Registra flowchart
   * @param flowchartViewContainer Container do flowchart
   * @param flowchartElement Elemento do flowchart
   * @param svgCanvas Svg utilizado para renderizar conectores
   */
  public initFlowchart(
    flowchartViewContainer: ViewContainerRef,
    flowchartElement: ElementRef<HTMLDivElement>,
    svgCanvas: ElementRef<SVGElement>
  ): void {
    this.connectorsService.registerSvg(svgCanvas.nativeElement);
    this.flowchartRendererService.registerFlowchart(flowchartViewContainer, flowchartElement, svgCanvas);
    this.flowchartStepsService.registerFlowchart(flowchartViewContainer, flowchartElement);
  }
}

export const flowB = {
  _id: '6604614475f12897926ba315',
  name: '[B4Commerce] > [VTEX] Envio de SKU individual - FKEN',
  initialExecutionBlock: {
    blockId: 's1709920223011',
    type: 'REQUEST',
    mappings: {
      'headers->Authorization': '{{context.s1709920223011.environment.variables.token}}',
      'queryParams->id': '{{context.initialExecutionContext.b4SkuId}}',
    },
    requestId: '65e9f727e85160d64b3b731a',
    shouldRegisterLog: false,
    nextBlocks: {
      success: {
        blockId: 's1709920771694',
        type: 'REQUEST',
        mappings: {
          'queryParams->sapCode': '{{context.s1709920223011.successResponse.body.produtos.0.sku}}',
        },
        requestId: '65eb0e324ea422e49755e522',
        shouldRegisterLog: false,
        nextBlocks: {
          success: {
            blockId: 's1709920259673',
            type: 'FLOW_REQUEST',
            mappings: {
              pai_id: '{{context.s1709920223011.successResponse.body.produtos.0.pai_id}}',
            },
            flowEndpoint: 'b4commerce-vtex-envio-de-produto-individual-fken',
            shouldRegisterLog: false,
            nextBlocks: {},
          },
          error: {
            blockId: 's1710568770868',
            type: 'EXECUTION_RETURN',
            mappings: {},
            lastMessage:
              'Erro ao tentar buscar SKU {{context.s1709920223011.successResponse.body.produtos.0.nome}}(skuId: {{context.s1709920223011.successResponse.body.produtos.0.sku}}) dentro do Sap, motivo:{{context.s1709920771694.errorResponse.body}}',
            executionReturnStatus: 'ERROR',
            shouldRegisterLog: false,
            expectedReturnLooseBody: null,
            expectedErrorReturnLooseBody: null,
            nextBlocks: {
              success: null,
              error: null,
            },
          },
        },
      },
      error: {
        blockId: 's1709923514503',
        type: 'EXECUTION_RETURN',
        mappings: {},
        lastMessage:
          'Erro ao tentar buscar SKU {{context.initialExecutionContext.b4SkuId}} dentro do B4C, motivo: {{context.s1709920223011.errorResponse.body}}',
        executionReturnStatus: 'ERROR',
        shouldRegisterLog: false,
        expectedReturnLooseBody: null,
        expectedErrorReturnLooseBody: null,
        nextBlocks: {
          success: null,
          error: null,
        },
      },
    },
  },
  trigger: {
    endpoint: 'b4commerce-vtex-envio-de-sku-individual-fken',
    hasCronTask: false,
    expectedBody: [
      {
        key: 'b4SkuId',
        valueType: 'STRING',
        documentation: null,
      },
    ],
    expectedReturnBody: [
      {
        key: 'sapId',
        valueType: 'STRING',
        documentation: null,
      },
      {
        key: 'productSapId',
        valueType: 'STRING',
        documentation: null,
      },
      {
        key: 'vtexId',
        valueType: 'NUMBER',
        documentation: null,
      },
      {
        key: 'productVtexId',
        valueType: 'NUMBER',
        documentation: null,
      },
    ],
    expectedErrorReturnBody: [],
    expectedReturnHeaders: [],
    isExpectedReturnLooseBody: null,
    isExpectedErrorReturnLooseBody: null,
  },
  group: 'CATALOG - FKEN',
  isActive: true,
  companyId: '6593557f39ad96463fef3ff3',
  sameAsPublishedVersion: true,
  isInternalQualityAssured: false,
  createdAt: '2024-03-27T18:11:16.703Z',
  baseFlowId: '65eb53374ea422e4976477b0',
  internalQualityAssuredUserId: null,
  updatedAt: '2024-03-27T18:09:09.391Z',
  parentVersionFlowId: '65fc2282636c8c34a7cea9b8',
  executionIdsRunning: ['660d3f71adbade81e8380c28'],
  isRunning: true,
  runnerMetadata: {
    hostname: 'prod-iotahub-server-deployment-dc9498f5b-gfs94',
    shutdownRunning: false,
  },
  parentVersionFlow: {
    _id: '65fc2282636c8c34a7cea9b8',
    name: '[B4Commerce] > [VTEX] Envio de SKU individual - FKEN',
    trigger: {
      endpoint: 'b4commerce-vtex-envio-de-sku-individual-fken',
      hasCronTask: false,
      expectedBody: [
        {
          key: 'b4SkuId',
          valueType: 'STRING',
          documentation: null,
        },
      ],
      expectedReturnBody: [
        {
          key: 'sapId',
          valueType: 'STRING',
          documentation: null,
        },
        {
          key: 'productSapId',
          valueType: 'STRING',
          documentation: null,
        },
        {
          key: 'vtexId',
          valueType: 'NUMBER',
          documentation: null,
        },
        {
          key: 'productVtexId',
          valueType: 'NUMBER',
          documentation: null,
        },
      ],
      expectedErrorReturnBody: [],
      expectedReturnHeaders: [],
      isExpectedReturnLooseBody: null,
      isExpectedErrorReturnLooseBody: null,
    },
    group: 'CATALOG - FKEN',
    isActive: true,
    companyId: '6593557f39ad96463fef3ff3',
    sameAsPublishedVersion: false,
    isInternalQualityAssured: false,
    createdAt: '2024-03-21T12:05:22.054Z',
    baseFlowId: '65eb53374ea422e4976477b0',
    internalQualityAssuredUserId: null,
    updatedAt: '2024-03-27T18:11:16.698Z',
    parentVersionFlowId: '65f9ceba3850987f9fd56828',
    executionIdsRunning: ['660d3f71adbade81e8380c28'],
    isRunning: true,
    runnerMetadata: {
      hostname: 'prod-iotahub-server-deployment-dc9498f5b-gfs94',
      shutdownRunning: false,
    },
    parentVersionFlow: {
      _id: '65f9ceba3850987f9fd56828',
      name: '[B4Commerce] > [VTEX] Envio de SKU individual - FKEN',
      trigger: {
        endpoint: 'b4commerce-vtex-envio-de-sku-individual-fken',
        hasCronTask: false,
        expectedBody: [
          {
            key: 'b4SkuId',
            valueType: 'STRING',
            documentation: null,
          },
        ],
        expectedReturnBody: [
          {
            key: 'sapId',
            valueType: 'STRING',
            documentation: null,
          },
          {
            key: 'productSapId',
            valueType: 'STRING',
            documentation: null,
          },
          {
            key: 'vtexId',
            valueType: 'NUMBER',
            documentation: null,
          },
          {
            key: 'productVtexId',
            valueType: 'NUMBER',
            documentation: null,
          },
        ],
        expectedErrorReturnBody: [],
        expectedReturnHeaders: [],
        isExpectedReturnLooseBody: null,
        isExpectedErrorReturnLooseBody: null,
      },
      group: 'CATALOG - FKEN',
      isActive: true,
      companyId: '6593557f39ad96463fef3ff3',
      sameAsPublishedVersion: false,
      isInternalQualityAssured: false,
      createdAt: '2024-03-19T17:43:22.945Z',
      baseFlowId: '65eb53374ea422e4976477b0',
      internalQualityAssuredUserId: null,
      updatedAt: '2024-03-21T12:05:22.048Z',
      parentVersionFlowId: '65f89b993850987f9fb84c98',
      executionIdsRunning: [],
      isRunning: false,
      runnerMetadata: {
        hostname: null,
        shutdownRunning: false,
      },
      parentVersionFlow: {
        _id: '65f89b993850987f9fb84c98',
        name: '[B4Commerce] > [VTEX] Envio de SKU individual - FKEN',
        trigger: {
          endpoint: 'b4commerce-vtex-envio-de-sku-individual-fken',
          hasCronTask: false,
          expectedBody: [
            {
              key: 'b4SkuId',
              valueType: 'STRING',
              documentation: null,
            },
          ],
          expectedReturnBody: [
            {
              key: 'sapId',
              valueType: 'STRING',
              documentation: null,
            },
            {
              key: 'productSapId',
              valueType: 'STRING',
              documentation: null,
            },
            {
              key: 'vtexId',
              valueType: 'NUMBER',
              documentation: null,
            },
            {
              key: 'productVtexId',
              valueType: 'NUMBER',
              documentation: null,
            },
          ],
          expectedErrorReturnBody: [],
          expectedReturnHeaders: [],
          isExpectedReturnLooseBody: null,
          isExpectedErrorReturnLooseBody: null,
        },
        group: 'CATALOG - FKEN',
        isActive: true,
        companyId: '6593557f39ad96463fef3ff3',
        sameAsPublishedVersion: false,
        isInternalQualityAssured: false,
        createdAt: '2024-03-18T19:52:57.864Z',
        baseFlowId: '65eb53374ea422e4976477b0',
        internalQualityAssuredUserId: null,
        updatedAt: '2024-03-19T17:43:22.939Z',
        parentVersionFlowId: '65f89ab5b40edd3b3822746c',
        executionIdsRunning: [],
        isRunning: false,
        runnerMetadata: {
          hostname: null,
          shutdownRunning: false,
        },
        parentVersionFlow: {
          _id: '65f89ab5b40edd3b3822746c',
          name: '[B4Commerce] > [VTEX] Envio de SKU individual - FKEN',
          trigger: {
            endpoint: 'b4commerce-vtex-envio-de-sku-individual-fken',
            hasCronTask: false,
            expectedBody: [
              {
                key: 'b4SkuId',
                valueType: 'STRING',
                documentation: null,
              },
            ],
            expectedReturnBody: [
              {
                key: 'sapId',
                valueType: 'STRING',
                documentation: null,
              },
              {
                key: 'productSapId',
                valueType: 'STRING',
                documentation: null,
              },
              {
                key: 'vtexId',
                valueType: 'NUMBER',
                documentation: null,
              },
              {
                key: 'productVtexId',
                valueType: 'NUMBER',
                documentation: null,
              },
            ],
            expectedErrorReturnBody: [],
            expectedReturnHeaders: [],
            isExpectedReturnLooseBody: null,
            isExpectedErrorReturnLooseBody: null,
          },
          group: 'CATALOG - FKEN',
          isActive: true,
          companyId: '6593557f39ad96463fef3ff3',
          sameAsPublishedVersion: false,
          isInternalQualityAssured: false,
          createdAt: '2024-03-18T19:49:09.795Z',
          baseFlowId: '65eb53374ea422e4976477b0',
          internalQualityAssuredUserId: null,
          updatedAt: '2024-03-18T19:52:57.850Z',
          parentVersionFlowId: '65f536e486a8c26ab40d0afe',
          executionIdsRunning: [],
          isRunning: false,
          runnerMetadata: {
            hostname: null,
            shutdownRunning: false,
          },
          parentVersionFlow: {
            _id: '65f536e486a8c26ab40d0afe',
            name: '[B4Commerce] > [VTEX] Envio de SKU individual - FKEN',
            trigger: {
              endpoint: 'b4commerce-vtex-envio-de-sku-individual-fken',
              hasCronTask: false,
              expectedBody: [
                {
                  key: 'b4SkuId',
                  valueType: 'STRING',
                  documentation: null,
                },
              ],
              expectedReturnBody: [
                {
                  key: 'sapId',
                  valueType: 'STRING',
                  documentation: null,
                },
                {
                  key: 'productSapId',
                  valueType: 'STRING',
                  documentation: null,
                },
                {
                  key: 'vtexId',
                  valueType: 'NUMBER',
                  documentation: null,
                },
                {
                  key: 'productVtexId',
                  valueType: 'NUMBER',
                  documentation: null,
                },
              ],
              expectedErrorReturnBody: [],
              expectedReturnHeaders: [],
              isExpectedReturnLooseBody: null,
              isExpectedErrorReturnLooseBody: null,
            },
            group: 'CATALOG - FKEN',
            isActive: true,
            companyId: '6593557f39ad96463fef3ff3',
            sameAsPublishedVersion: false,
            isInternalQualityAssured: false,
            createdAt: '2024-03-16T06:06:28.481Z',
            baseFlowId: '65eb53374ea422e4976477b0',
            internalQualityAssuredUserId: null,
            updatedAt: '2024-03-18T19:49:09.789Z',
            parentVersionFlowId: '65ef877e9931ab581d345a68',
            executionIdsRunning: [],
            isRunning: false,
            runnerMetadata: {
              hostname: null,
              shutdownRunning: false,
            },
            parentVersionFlow: {
              _id: '65ef877e9931ab581d345a68',
              name: '[B4Commerce] > [VTEX] Envio de SKU individual - FKEN',
              trigger: {
                endpoint: 'b4commerce-vtex-envio-de-sku-individual-fken',
                hasCronTask: false,
                expectedBody: [
                  {
                    key: 'b4SkuId',
                    valueType: 'STRING',
                    documentation: null,
                  },
                ],
                expectedReturnBody: [
                  {
                    key: 'sapId',
                    valueType: 'STRING',
                    documentation: null,
                  },
                  {
                    key: 'productSapId',
                    valueType: 'STRING',
                    documentation: null,
                  },
                  {
                    key: 'vtexId',
                    valueType: 'NUMBER',
                    documentation: null,
                  },
                  {
                    key: 'productVtexId',
                    valueType: 'NUMBER',
                    documentation: null,
                  },
                ],
                expectedErrorReturnBody: [],
                expectedReturnHeaders: [],
                isExpectedReturnLooseBody: null,
                isExpectedErrorReturnLooseBody: null,
              },
              group: 'CATALOG - FKEN',
              isActive: true,
              companyId: '6593557f39ad96463fef3ff3',
              sameAsPublishedVersion: false,
              isInternalQualityAssured: false,
              createdAt: '2024-03-11T22:36:46.686Z',
              baseFlowId: '65eb53374ea422e4976477b0',
              internalQualityAssuredUserId: null,
              updatedAt: '2024-03-16T06:06:28.477Z',
              parentVersionFlowId: '65eb67bac1f24c39ff1b211f',
              executionIdsRunning: [],
              isRunning: false,
              runnerMetadata: {
                hostname: null,
                shutdownRunning: false,
              },
              parentVersionFlow: {
                _id: '65eb67bac1f24c39ff1b211f',
                name: '[B4Commerce] > [VTEX] Envio de SKU individual - FKEN',
                trigger: {
                  endpoint: 'b4commerce-vtex-envio-de-sku-individual-fken',
                  hasCronTask: false,
                  expectedBody: [
                    {
                      key: 'b4SkuId',
                      valueType: 'STRING',
                      documentation: null,
                    },
                  ],
                  expectedReturnBody: [
                    {
                      key: 'sapId',
                      valueType: 'STRING',
                      documentation: null,
                    },
                    {
                      key: 'productSapId',
                      valueType: 'STRING',
                      documentation: null,
                    },
                    {
                      key: 'vtexId',
                      valueType: 'NUMBER',
                      documentation: null,
                    },
                    {
                      key: 'productVtexId',
                      valueType: 'NUMBER',
                      documentation: null,
                    },
                  ],
                  expectedErrorReturnBody: [],
                  expectedReturnHeaders: [],
                  isExpectedReturnLooseBody: null,
                  isExpectedErrorReturnLooseBody: null,
                },
                group: 'CATALOG - FKEN',
                isActive: true,
                companyId: '6593557f39ad96463fef3ff3',
                sameAsPublishedVersion: false,
                isInternalQualityAssured: false,
                createdAt: '2024-03-08T19:32:10.943Z',
                baseFlowId: '65eb53374ea422e4976477b0',
                internalQualityAssuredUserId: null,
                updatedAt: '2024-03-11T22:36:46.682Z',
                parentVersionFlowId: '65eb53374ea422e4976477b0',
                executionIdsRunning: [],
                isRunning: false,
                runnerMetadata: {
                  hostname: null,
                  shutdownRunning: false,
                },
                parentVersionFlow: {
                  _id: '65eb53374ea422e4976477b0',
                  name: '[B4Commerce] > [VTEX] Envio de SKU individual - FKEN',
                  trigger: {
                    endpoint: 'b4commerce-vtex-envio-de-sku-individual-fken',
                    hasCronTask: false,
                    expectedBody: [
                      {
                        key: 'b4SkuId',
                        valueType: 'STRING',
                        documentation: null,
                      },
                    ],
                    expectedReturnBody: [
                      {
                        key: 'sapId',
                        valueType: 'STRING',
                        documentation: null,
                      },
                      {
                        key: 'productSapId',
                        valueType: 'STRING',
                        documentation: null,
                      },
                      {
                        key: 'vtexId',
                        valueType: 'NUMBER',
                        documentation: null,
                      },
                      {
                        key: 'productVtexId',
                        valueType: 'NUMBER',
                        documentation: null,
                      },
                    ],
                    expectedErrorReturnBody: [],
                    expectedReturnHeaders: [],
                    isExpectedReturnLooseBody: null,
                    isExpectedErrorReturnLooseBody: null,
                  },
                  group: 'CATALOG - FKEN',
                  isActive: true,
                  companyId: '6593557f39ad96463fef3ff3',
                  sameAsPublishedVersion: false,
                  isInternalQualityAssured: false,
                  createdAt: '2024-03-08T18:04:39.781Z',
                  baseFlowId: '65eb53374ea422e4976477b0',
                  internalQualityAssuredUserId: null,
                  updatedAt: '2024-03-08T19:32:10.932Z',
                  version: 1,
                  versionDescription: null,
                  executionIdsRunning: [],
                  isRunning: false,
                  runnerMetadata: {
                    hostname: null,
                    shutdownRunning: false,
                  },
                },
                version: 2,
                versionDescription: null,
              },
              version: 3,
              versionDescription: null,
            },
            version: 4,
            versionDescription: null,
          },
          version: 5,
          versionDescription: null,
        },
        version: 6,
        versionDescription: null,
      },
      version: 7,
      versionDescription: null,
    },
    version: 8,
    versionDescription: null,
  },
  lastPublishedVersion: 8,
};
