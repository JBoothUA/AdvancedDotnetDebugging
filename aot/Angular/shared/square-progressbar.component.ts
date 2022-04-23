import {
    Component, Input, OnChanges, AfterViewInit,
    ChangeDetectorRef, ViewChild, OnInit,
    ChangeDetectionStrategy
} from '@angular/core';

@Component({
    selector: 'square-progressbar',
    templateUrl: 'square-progressbar.component.html',
    styleUrls: ['square-progressbar.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SquareProgressbar implements OnInit, AfterViewInit{
    @ViewChild('svgRect') elementSVG: any;

    @Input() set completenessPercentage(data: number) {
        this.setcompleteness((data === 0) ? 0.000001 : data);
    }
    @Input() fillColor: string = '#249C49';
    @Input() image: string = '';
    @Input() strokeWidth: number = 3;
    @Input() size: number = 34;

    public completeness: number = 0;
    public dasharray: number;
    public animation: NodeJS.Timer = null;
    public adjustedSize: number;
    public imageSize: number = 0;

    constructor(private ref: ChangeDetectorRef) { }

    public getDashOffset(): number {
        return this.dasharray - (this.completeness * this.dasharray);
    }

	public ngAfterViewInit(): void {
        this.dasharray = this.getRectLength(this.elementSVG.nativeElement.width.baseVal.value, this.elementSVG.nativeElement.height.baseVal.value);
    }

    public ngOnInit(): void {
        this.adjustedSize = Math.sqrt(Math.pow(this.size, 2) / 2);
        this.imageSize = Math.sqrt(2 * Math.pow((this.adjustedSize - (this.strokeWidth * 2)), 2));
    }

    private setcompleteness(newValue: number): void {
        //Stop any animation that is running
        if (this.animation !== null) {
            clearInterval(this.animation);
            this.animation = null;
        }

        let range: number = Math.abs(this.completeness - newValue);
        let tempValue: number = this.completeness;

        this.animation = setInterval(() => {
            tempValue += (range / 60);
            this.completeness = tempValue;
            if (tempValue > newValue) {
                this.completeness = newValue;
                clearInterval(this.animation);
                this.animation = null;
            }
            this.ref.markForCheck();
        }, 16.665);
    }

    private getRectLength(width: number, height: number): number {
        return (width * 2) + (height * 2);
    }

    ngOnDestroy() {
        if (this.animation !== null) {
            clearInterval(this.animation);
            this.animation = null;
        }
    }
}