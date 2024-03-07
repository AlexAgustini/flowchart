import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DragService {
  private _isHoveringOverDropArea: boolean;

  public get isHoveringOverDropArea(): boolean {
    return this._isHoveringOverDropArea;
  }

  public set isHoveringOverDropArea(isHoveringOverDropArea: boolean) {
    this._isHoveringOverDropArea = isHoveringOverDropArea;
  }
}
