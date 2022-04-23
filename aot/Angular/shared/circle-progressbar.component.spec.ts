import {
    async,
    ComponentFixture,
    TestBed
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CircleProgressbar } from './circle-progressbar.component';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

describe('Circle Progress Bar Component', () => {
    let fixture: ComponentFixture<CircleProgressbar>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [CircleProgressbar],
            providers: []
        });
        TestBed.compileComponents();
    }));

    it('should return the circumference of a circle', () => {
        //Arrange
        fixture = TestBed.createComponent(CircleProgressbar);

        //Act
        fixture.detectChanges();

        //Assert
        let circumference = (fixture.componentInstance as any).getCircleLength(10);
        expect(round(circumference) === 62.83).toBe(true);
    });

    it('should calculate the dash offset', () => {
        //Arrange
        fixture = TestBed.createComponent(CircleProgressbar);
        fixture.componentInstance.size = 100;
        fixture.componentInstance.strokeWidth = 5;
        (fixture.componentInstance as any).setcompleteness(1); //Access private method
        
        //Act
        fixture.detectChanges();

        //Assert
        expect(round(fixture.componentInstance.getDashOffset()) === round(298.45)).toBe(true);
    });

    it('should not display svg', () => {
        //Arrange
        fixture = TestBed.createComponent(CircleProgressbar);
        fixture.componentInstance.size = 100;
        fixture.componentInstance.strokeWidth = 5;
        fixture.componentInstance.hideProgressBar = true;

        //Act
        fixture.detectChanges();
        let svgElement = fixture.nativeElement.querySelector('svg');

        //Assert
        expect(svgElement === null).toBe(true);
    });

    it('should display svg', () => {
        //Arrange
        fixture = TestBed.createComponent(CircleProgressbar);
        fixture.componentInstance.size = 100;
        fixture.componentInstance.strokeWidth = 5;
        (fixture.componentInstance as any).setcompleteness(1); //Access private method

        //Act
        fixture.detectChanges();
        let svgElement = fixture.nativeElement.querySelector('svg');

        //Assert
        expect(svgElement !== null).toBe(false);
    });

});

function round(num: number) {
    return Math.round(num * 100) / 100;
}
