import {
    async,
    ComponentFixture,
    TestBed
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SayPlayChooser } from './say-play-chooser.component';
import { SharedModule } from '../shared/_shared.module';
import { CommandName } from './../patrols/action.class';
import { PlatformMapService } from '../map/platforms/platformMap.service';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

describe('Say play component', () => {
    let fixture: ComponentFixture<SayPlayChooser>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, SharedModule],
            declarations: [],
            providers: [PlatformMapService]
        });
        TestBed.compileComponents();
    }));

    //it('should display in normal mode', () => {
    //    // Arrange
    //    fixture = TestBed.createComponent(SayPlayChooser);
    //    fixture.componentInstance.mode = 'normal';

    //    // Act
    //    fixture.detectChanges();

    //    // Assert
    //    expect($(fixture.nativeElement).find('img').length).toBeGreaterThan(0)
    //});

    //it('should display in compact mode', () => {
    //    // Arrange
    //    fixture = TestBed.createComponent(SayPlayChooser);
    //    fixture.componentInstance.mode = 'compact';

    //    // Act
    //    fixture.detectChanges();

    //    // Assert
    //    expect($(fixture.nativeElement).find('img').length).toBe(0);
    //});

    //it('should select message option in normal mode', () => {
    //    // Arrange
    //    fixture = TestBed.createComponent(SayPlayChooser);
    //    fixture.componentInstance.mode = 'normal';
    //    fixture.componentInstance.commandName = CommandName.SayMessage;

    //    // Act
    //    fixture.detectChanges();

    //    // Assert
    //    expect((fixture.componentInstance as any).selectedType).toBe(2);
    //});

    //it('should select audio file option in normal mode', () => {
    //    // Arrange
    //    fixture = TestBed.createComponent(SayPlayChooser);
    //    fixture.componentInstance.mode = 'normal';
    //    fixture.componentInstance.commandName = CommandName.Play;

    //    // Act
    //    fixture.detectChanges();

    //    // Assert
    //    expect((fixture.componentInstance as any).selectedType).toBe(3);
    //});

    //it('should select preset message option in compact mode', () => {
    //    // Arrange
    //    fixture = TestBed.createComponent(SayPlayChooser);
    //    fixture.componentInstance.mode = 'compact';
    //    fixture.componentInstance.commandName = CommandName.SayMessage;

    //    // Act
    //    fixture.detectChanges();

    //    // Assert
    //    expect((fixture.componentInstance as any).selectedType).toBe(0);
    //});

    //it('should select audio file option in compact mode', () => {
    //    // Arrange
    //    fixture = TestBed.createComponent(SayPlayChooser);
    //    fixture.componentInstance.mode = 'compact';
    //    fixture.componentInstance.commandName = CommandName.Play;

    //    // Act
    //    fixture.detectChanges();

    //    // Assert
    //    expect((fixture.componentInstance as any).selectedType).toBe(3);
    //});

    //it('should populate custom message in normal mode', () => {
    //    // Arrange
    //    fixture = TestBed.createComponent(SayPlayChooser);
    //    fixture.componentInstance.mode = 'normal';
    //    fixture.componentInstance.commandName = CommandName.SayMessage;
    //    fixture.componentInstance.sayParameterList = {
    //        DisplayName: 'test',
    //        Presets: [{
    //            Name: 'test',
    //            DisplayName: 'test',
    //            BooleanValue: null,
    //            StringValue: 'test',
    //            IntValue: null,
    //            DoubleValue: null,
    //            ImageValue: null,
    //            type: null
    //        }
    //        ]
    //    };

    //    fixture.componentInstance.playParameterList = {
    //        DisplayName: 'test',
    //        Presets: [{
    //            Name: 'test',
    //            DisplayName: 'test',
    //            BooleanValue: null,
    //            StringValue: 'test',
    //            IntValue: null,
    //            DoubleValue: null,
    //            ImageValue: null,
    //            type: null
    //        }
    //        ]
    //    };

    //    // Act
    //    fixture.detectChanges();
    //    fixture.componentInstance.setValue(CommandName.SayMessage, 'custom message');
    //    fixture.detectChanges();

    //    // Assert
    //    expect((fixture.componentInstance as any).customItem).not.toBeUndefined();
    //    expect((fixture.componentInstance as any).selectedItem).toBeUndefined();
    //});

    //it('should populate custom message in compact mode', () => {
    //    // Arrange
    //    fixture = TestBed.createComponent(SayPlayChooser);
    //    fixture.componentInstance.mode = 'compact';
    //    fixture.componentInstance.commandName = CommandName.SayMessage;
    //    fixture.componentInstance.sayParameterList = {
    //        DisplayName: 'test',
    //        Presets: [{
    //            Name: 'test',
    //            DisplayName: 'test',
    //            BooleanValue: null,
    //            StringValue: 'test',
    //            IntValue: null,
    //            DoubleValue: null,
    //            ImageValue: null,
    //            type: null
    //        }
    //        ]
    //    };

    //    fixture.componentInstance.playParameterList = {
    //        DisplayName: 'test',
    //        Presets: [{
    //            Name: 'test',
    //            DisplayName: 'test',
    //            BooleanValue: null,
    //            StringValue: 'test',
    //            IntValue: null,
    //            DoubleValue: null,
    //            ImageValue: null,
    //            type: null
    //        }
    //        ]
    //    };

    //    // Act
    //    fixture.detectChanges();
    //    fixture.componentInstance.setValue(CommandName.SayMessage, 'custom message');
    //    fixture.detectChanges();

    //    // Assert
    //    expect((fixture.componentInstance as any).customItem).not.toBeUndefined();
    //    expect((fixture.componentInstance as any).selectedItem).toBeUndefined();
    //});

});