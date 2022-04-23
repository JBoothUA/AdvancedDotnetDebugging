import {
    async,
    ComponentFixture,
    TestBed
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { SquareProgressbar } from './square-progressbar.component';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

describe('Square progress bar component', () => {
    let fixture: ComponentFixture<SquareProgressbar>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [SquareProgressbar],
            providers: []
        });
        TestBed.compileComponents();
    }));

    it('should get the length of a rectangle', () => {
        //Arrange
        fixture = TestBed.createComponent(SquareProgressbar);

        //Act
        let length = (fixture.componentInstance as any).getRectLength(10, 15);

        //Assert
        expect(length).toBe(50);
    });

});