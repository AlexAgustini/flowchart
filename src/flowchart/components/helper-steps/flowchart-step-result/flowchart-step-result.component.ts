import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FlowchartStepComponent } from '../../flowchart-step-component/flowchart-step.component';
import { IconsModule } from '../../../../app/feather/feather.module';
import { FlowchartStepResultsEnum } from '../../../enums/flowchart-step-results-enum';
import { EMPTY, concatMap, interval } from 'rxjs';

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
    this.dropAreaInterval
      .pipe(
        concatMap(async () => {
          if (!this.children.length) {
            await this.addDroparea();
          }
        })
      )
      .subscribe();
  };

  private dropAreaInterval = interval(50);
}
