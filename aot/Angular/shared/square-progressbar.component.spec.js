import { async, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SquareProgressbar } from './square-progressbar.component';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
describe('Square progress bar component', function () {
    var fixture;
    beforeEach(async(function () {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [SquareProgressbar],
            providers: []
        });
        TestBed.compileComponents();
    }));
    it('should get the length of a rectangle', function () {
        //Arrange
        fixture = TestBed.createComponent(SquareProgressbar);
        //Act
        var length = fixture.componentInstance.getRectLength(10, 15);
        //Assert
        expect(length).toBe(50);
    });
});
//# sourceMappingURL=square-progressbar.component.spec.js.map