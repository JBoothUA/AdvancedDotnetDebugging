import {
    Component, Input, OnChanges,
    ChangeDetectionStrategy, ChangeDetectorRef, ViewChild,
    AfterViewInit
} from '@angular/core';

@Component({
    selector: 'circle-progressbar',
    templateUrl: 'circle-progressbar.component.html',
    styleUrls: ['circle-progressbar.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CircleProgressbar {
    @ViewChild('svgCircle') elementSVG: any;

    @Input() set completenessPercentage(data: number) {
        this.setcompleteness(data);
    }
    @Input() fillColor: string = '#249C49';
    @Input() image: string = null;
    @Input() size: number = 50;
    @Input() strokeWidth: number = 5;
	@Input() hideProgressBar: boolean = true;
    @Input() isDisabled: boolean = false;
    
    private animation: NodeJS.Timer = null;
    private completeness: number = 0.0;
    private dasharray: number;
    
    constructor(private ref: ChangeDetectorRef) { }

    public getDashOffset(): number {
        return this.dasharray - (this.completeness * this.dasharray);
    }

    public ngAfterViewInit(): void {
        //if (this.elementSVG)
            this.dasharray = this.getCircleLength((this.size - this.strokeWidth)/2);
            //this.dasharray = this.elementSVG.nativeElement.getTotalLength();
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

            if (tempValue >= newValue) {
                this.completeness = newValue;
                clearInterval(this.animation);
                this.animation = null;
            }
            this.ref.detectChanges();
        }, 16.665);
    }

    private getCircleLength(r:number): number {
        return 2 * Math.PI * r;
    }

    ngOnDestroy() {
        if (this.animation !== null) {
            clearInterval(this.animation);
            this.animation = null;
        }
	}
}
