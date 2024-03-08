import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FlowchartComponent } from '../flowchart/flowchart.component';
import { FlowchartStepDirective } from '../flowchart/directives/flowchart-step.directive';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { FlowBlocksEnum } from '../flowchart/helpers/flowchart-steps-registry';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FlowchartComponent,
    FlowchartStepDirective,
    CdkDrag,
    CdkDropList,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  flowBlocksEnum = FlowBlocksEnum;

  title = 'flowchart';
}
