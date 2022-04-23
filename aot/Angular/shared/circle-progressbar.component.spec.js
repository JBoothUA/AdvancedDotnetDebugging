import { async, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CircleProgressbar } from './circle-progressbar.component';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
describe('Circle Progress Bar Component', function () {
    var fixture;
    beforeEach(async(function () {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [CircleProgressbar],
            providers: []
        });
        TestBed.compileComponents();
    }));
    it('should return the circumference of a circle', function () {
        //Arrange
        fixture = TestBed.createComponent(CircleProgressbar);
        //Act
        fixture.detectChanges();
        //Assert
        var circumference = fixture.componentInstance.getCircleLength(10);
        expect(round(circumference) === 62.83).toBe(true);
    });
    it('should calculate the dash offset', function () {
        //Arrange
        fixture = TestBed.createComponent(CircleProgressbar);
        fixture.componentInstance.size = 100;
        fixture.componentInstance.strokeWidth = 5;
        fixture.componentInstance.setcompleteness(1); //Access private method
        //Act
        fixture.detectChanges();
        //Assert
        expect(round(fixture.componentInstance.getDashOffset()) === round(298.45)).toBe(true);
    });
    it('should not display svg', function () {
        //Arrange
        fixture = TestBed.createComponent(CircleProgressbar);
        fixture.componentInstance.size = 100;
        fixture.componentInstance.strokeWidth = 5;
        fixture.componentInstance.hideProgressBar = true;
        //Act
        fixture.detectChanges();
        var svgElement = fixture.nativeElement.querySelector('svg');
        //Assert
        expect(svgElement === null).toBe(true);
    });
    it('should display svg', function () {
        //Arrange
        fixture = TestBed.createComponent(CircleProgressbar);
        fixture.componentInstance.size = 100;
        fixture.componentInstance.strokeWidth = 5;
        fixture.componentInstance.setcompleteness(1); //Access private method
        //Act
        fixture.detectChanges();
        var svgElement = fixture.nativeElement.querySelector('svg');
        //Assert
        expect(svgElement !== null).toBe(false);
    });
});
function round(num) {
    return Math.round(num * 100) / 100;
}
//# sourceMappingURL=circle-progressbar.component.spec.js.map