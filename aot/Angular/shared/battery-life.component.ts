import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
    selector: 'battery-life',
    template:   `<img style="float:left" class="lpPlatformAddInfo_BatteryIcon" src="{{getPlatformBatteryIconSrc()}}" /> 
                 <span *ngIf="showPercentage" style="float:left;margin-top:-5px;">{{batteryPercentage}}%</span>
                `,
    styles: [':host{float:left;width:66px;}'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BatteryLife {
    @Input() batteryPercentage: number;
    @Input() showPercentage: boolean = true;
    
    public getPlatformBatteryIconSrc(): string {
        if (this.batteryPercentage) {
            if (this.batteryPercentage > 90) {
                return '/Content/Images/Platforms/battery-icons-100.png';
            } else if (this.batteryPercentage > 80) {
                return '/Content/Images/Platforms/battery-icons-90.png';
            } else if (this.batteryPercentage > 70) {
                return '/Content/Images/Platforms/battery-icons-80.png';
            } else if (this.batteryPercentage > 60) {
                return '/Content/Images/Platforms/battery-icons-70.png';
            } else if (this.batteryPercentage > 50) {
                return '/Content/Images/Platforms/battery-icons-60.png';
            } else if (this.batteryPercentage > 40) {
                return '/Content/Images/Platforms/battery-icons-50.png';
            } else if (this.batteryPercentage > 30) {
                return '/Content/Images/Platforms/battery-icons-40.png';
            } else if (this.batteryPercentage > 20) {
                return '/Content/Images/Platforms/battery-icons-30.png';
            } else if (this.batteryPercentage > 10) {
                return '/Content/Images/Platforms/battery-icons-20.png';
            } else if (this.batteryPercentage > 5) {
                return '/Content/Images/Platforms/battery-icons-10.png';
            } else {
                return '/Content/Images/Platforms/battery-icons-5.png';
            }
        }
        return '/Content/Images/Platforms/battery-icons-5.png';
    }
}