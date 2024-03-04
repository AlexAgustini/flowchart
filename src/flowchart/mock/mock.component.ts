import { Component } from '@angular/core';
import { FlowchartStepDynamicComponent } from '../components/flowchart-step-dynamic-component/flowchart-step-dynamic.component';
import { FlowchartStepResultComponent } from '../components/flowchart-step-result/flowchart-step-result.component';

@Component({
  standalone: true,
  selector: 'mock',
  templateUrl: './mock.component.html',
  styleUrl: './mock.component.scss',
})
export class MockComponent extends FlowchartStepDynamicComponent {
  static override STEP_NAME = 'MOCK';
  ngOnInit() {}

  override addChild(): void {
    super.addChild({ STEP_NAME: FlowchartStepResultComponent.STEP_NAME });
  }

  log() {
    console.log(this);
  }
}
