import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FlowchartStepComponent } from '../../flowchart-step-component/flowchart-step.component';
import { IconsModule } from '../../../../app/feather/feather.module';
import { FlowchartStepResultsEnum } from '../../../enums/flowchart-step-results-enum';
import { interval } from 'rxjs';

@Component({
  selector: 'step-result-label',
  standalone: true,
  imports: [NgIf, IconsModule],
  templateUrl: './flowchart-step-result.component.html',
  styleUrl: './flowchart-step-result.component.scss',
})
export class FlowchartStepResultComponent extends FlowchartStepComponent {
  ngOnInit() {
    this.dragDir.disabled = true;
  }

  public flowchartStepResultsEnum = FlowchartStepResultsEnum;

  override afterChildrenInit = (): void => {
    this.dropAreaInterval.subscribe(() => {
      if (!this.children.length) {
        this.addDroparea();
      }
    });
  };

  private dropAreaInterval = interval(500);
}
