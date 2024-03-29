import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FlowchartComponent } from '../flowchart/flowchart.component';
import { FlowchartStepDirective } from '../flowchart/directives/flowchart-step.directive';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { FlowchartStepsEnum } from '../flowchart/enums/flowchart-steps.enum';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FlowchartComponent, FlowchartStepDirective, CdkDrag, CdkDropList],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  flowStepsEnum = Object.values(FlowchartStepsEnum).filter(
    (step) =>
      step !== FlowchartStepsEnum.STEP_INITIAL &&
      step !== FlowchartStepsEnum.STEP_DROPAREA &&
      step !== FlowchartStepsEnum.STEP_RESULT
  );

  title = 'flowchart';
}
