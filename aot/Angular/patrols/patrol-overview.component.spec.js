import { async, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/_shared.module';
import { PatrolService } from '../patrols/patrol.service';
import { HttpModule } from '@angular/http';
import { HttpService } from '../shared/http.service';
import { MockHttpService } from '../test/mockHttp.service';
import { UserService } from '../shared/user.service';
import { LocationFilterService } from '../shared/location-filter.service';
import { AlarmService } from '../alarms/alarm.service';
import { LocationFilterPipe } from '../shared/location-filter.pipe';
import { PlatformService } from '../platforms/platform.service';
import { PlatformMapService } from './../map/platforms/platformMap.service';
import { WindowService } from '../shared/window.service';
import { PatrolInstance } from '../patrols/patrol.class';
import { MockUserService } from '../test/mockUser.service';
import { Platform } from '../platforms/platform.class';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActionInstance } from '../patrols/action.class';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
describe('Patrol overview component', function () {
    var fixture;
    beforeEach(async(function () {
        TestBed.configureTestingModule({
            imports: [FormsModule, SharedModule, HttpModule, BrowserAnimationsModule],
            declarations: [],
            providers: [PatrolService, { provide: HttpService, useClass: MockHttpService }, { provide: UserService, useClass: MockUserService }, LocationFilterService,
                AlarmService, LocationFilterPipe, PlatformService, PlatformMapService, WindowService]
        });
        TestBed.compileComponents();
    }));
    //it('should NOT display path points that are reached', () => {
    //    // Arrange
    //    fixture = TestBed.createComponent(PatrolOverview);
    //    fixture.componentInstance.patrolInstance = mockPatrolInstance;
    //    fixture.componentInstance.platform = mockPlatform;
    //    // Act
    //    fixture.detectChanges();
    //    let foundPoints = fixture.nativeElement.querySelector('.point-item');
    //    //Assert
    //    expect(foundPoints).toBe(null);
    //});
    //it('should display not reached path points', () => {
    //    // Arrange
    //    let tempMockPatrolInstance = new PatrolInstance(mockPatrolInstance);
    //    tempMockPatrolInstance.Points[0].CurrentStatus = PointStatusValues.NotReached;
    //    tempMockPatrolInstance.Points[1].CurrentStatus = PointStatusValues.NotReached;
    //    fixture = TestBed.createComponent(PatrolOverview);
    //    fixture.componentInstance.patrolInstance = tempMockPatrolInstance;
    //    fixture.componentInstance.platform = mockPlatform;
    //    // Act
    //    fixture.detectChanges();
    //    let foundPoints = $(fixture.nativeElement);
    //    // Assert
    //    expect(foundPoints.find('.point-item').length).toBe(2);
    //});
    //it('should not display checkpoints if the status is unknown', () => {
    //    // Arrange
    //    let tempMockPatrolInstance = new PatrolInstance(mockPatrolInstance);
    //    tempMockPatrolInstance.Points[4].Actions.push(mockAction);
    //    tempMockPatrolInstance.Points[4].CurrentStatus = PointStatusValues.Unknown;
    //    fixture = TestBed.createComponent(PatrolOverview);
    //    fixture.componentInstance.patrolInstance = tempMockPatrolInstance;
    //    fixture.componentInstance.platform = mockPlatform;
    //    // Act
    //    fixture.detectChanges();
    //    let foundPoints = $(fixture.nativeElement);
    //    // Assert
    //    expect(foundPoints.find('.point-item').length).toBe(0);
    //});
    //it('should display checkpoint failed if any action status is unknown', () => {
    //    // Arrange
    //    let tempMockPatrolInstance = new PatrolInstance(mockPatrolInstance);
    //    tempMockPatrolInstance.Points[4].Actions.push(mockAction);
    //    tempMockPatrolInstance.Points[4].CurrentStatus = PointStatusValues.ActionsPerformed;
    //    fixture = TestBed.createComponent(PatrolOverview);
    //    fixture.componentInstance.patrolInstance = tempMockPatrolInstance;
    //    fixture.componentInstance.platform = mockPlatform;
    //    // Act
    //    fixture.detectChanges();
    //    let foundPoint = $(fixture.nativeElement).find('.point-item').find('img');
    //    // Assert
    //    expect(foundPoint.attr('src')).toBe('/Content/Images/Patrols/checkpoint-failed.png');
    //    expect(fixture.nativeElement.innerText).toContain('Checkpoint Failed');
    //    expect($(fixture.nativeElement).find('.failed').length).toBe(1);
    //});
    //it('should display checkpoint failed if any action is failed', () => {
    //    // Arrange
    //    let tempMockPatrolInstance = new PatrolInstance(mockPatrolInstance);
    //    let tempMockAction = new ActionInstance(mockAction);
    //    tempMockAction.CurrentStatus = ActionStatusValues.Failed;
    //    tempMockPatrolInstance.Points[4].Actions.push(tempMockAction);
    //    tempMockPatrolInstance.Points[4].CurrentStatus = PointStatusValues.ActionsPerformed;
    //    fixture = TestBed.createComponent(PatrolOverview);
    //    fixture.componentInstance.patrolInstance = tempMockPatrolInstance;
    //    fixture.componentInstance.platform = mockPlatform;
    //    // Act
    //    fixture.detectChanges();
    //    let foundPoint = $(fixture.nativeElement).find('.point-item').find('img');
    //    // Assert
    //    expect(foundPoint.attr('src')).toBe('/Content/Images/Patrols/checkpoint-failed.png');
    //    expect(fixture.nativeElement.innerText).toContain('Checkpoint Failed');
    //    expect($(fixture.nativeElement).find('.failed').length).toBe(1);
    //});
    //it('should display checkpoint failed if any action is unsupported', () => {
    //    // Arrange
    //    let tempMockPatrolInstance = new PatrolInstance(mockPatrolInstance);
    //    let tempMockAction = new ActionInstance(mockAction);
    //    tempMockAction.CurrentStatus = ActionStatusValues.Unsupported;
    //    tempMockPatrolInstance.Points[4].Actions.push(tempMockAction);
    //    tempMockPatrolInstance.Points[4].CurrentStatus = PointStatusValues.ActionsPerformed;
    //    fixture = TestBed.createComponent(PatrolOverview);
    //    fixture.componentInstance.patrolInstance = tempMockPatrolInstance;
    //    fixture.componentInstance.platform = mockPlatform;
    //    // Act
    //    fixture.detectChanges();
    //    let foundPoint = $(fixture.nativeElement).find('.point-item').find('img');
    //    // Assert
    //    expect(foundPoint.attr('src')).toBe('/Content/Images/Patrols/checkpoint-failed.png');
    //    expect(fixture.nativeElement.innerText).toContain('Checkpoint Failed');
    //    expect($(fixture.nativeElement).find('.failed').length).toBe(1);
    //});
    //it('should display checkpoint successful when actions are completed', () => {
    //    // Arrange
    //    let tempMockPatrolInstance = new PatrolInstance(mockPatrolInstance);
    //    let tempMockAction = new ActionInstance(mockAction);
    //    tempMockAction.CurrentStatus = ActionStatusValues.Completed;
    //    tempMockPatrolInstance.Points[4].Actions.push(tempMockAction);
    //    tempMockPatrolInstance.Points[4].CurrentStatus = PointStatusValues.ActionsPerformed;
    //    fixture = TestBed.createComponent(PatrolOverview);
    //    fixture.componentInstance.patrolInstance = tempMockPatrolInstance;
    //    fixture.componentInstance.platform = mockPlatform;
    //    // Act
    //    fixture.detectChanges();
    //    let foundPoint = $(fixture.nativeElement).find('.point-item').find('img');
    //    // Assert
    //    expect(foundPoint.attr('src')).toBe('/Content/Images/Patrols/checkpoint-succesful.png');
    //    expect(fixture.nativeElement.innerText).toContain('Checkpoint Complete');
    //    expect($(fixture.nativeElement).find('.completed').length).toBe(1);
    //});
    //it('should display start and end icons', () => {
    //    // Arrange
    //    let tempMockPatrolInstance = new PatrolInstance(mockPatrolInstance);
    //    let tempMockAction = new ActionInstance(mockAction);
    //    tempMockAction.CurrentStatus = ActionStatusValues.Completed;
    //    tempMockPatrolInstance.Points[0].Actions.push(tempMockAction);
    //    tempMockPatrolInstance.Points[0].CurrentStatus = PointStatusValues.ActionsPerformed;
    //    tempMockPatrolInstance.Points[1].Actions.push(tempMockAction);
    //    tempMockPatrolInstance.Points[1].CurrentStatus = PointStatusValues.ActionsPerformed;
    //    tempMockPatrolInstance.Points[4].Actions.push(tempMockAction);
    //    tempMockPatrolInstance.Points[4].CurrentStatus = PointStatusValues.ActionsPerformed;
    //    fixture = TestBed.createComponent(PatrolOverview);
    //    fixture.componentInstance.patrolInstance = tempMockPatrolInstance;
    //    fixture.componentInstance.platform = mockPlatform;
    //    // Act
    //    fixture.detectChanges();
    //    // Assert
    //    expect($(fixture.nativeElement).find('.startIcon[src="/Content/Images/Patrols/last-point.png"]').length).toBe(1);
    //    expect($(fixture.nativeElement).find('.startIcon[src="/Content/Images/Patrols/first-point.png"]').length).toBe(1);
    //});
    //it('should display actions in desc order', () => {
    //    // Arrange
    //    let tempMockPatrolInstance = new PatrolInstance(mockPatrolInstance);
    //    let tempMockAction = new ActionInstance(mockAction);
    //    tempMockAction.CurrentStatus = ActionStatusValues.Completed;
    //    tempMockPatrolInstance.Points[0].CurrentStatus = PointStatusValues.ActionsPerformed;
    //    tempMockPatrolInstance.Points[0].Actions.push(tempMockAction);
    //    tempMockPatrolInstance.Points[0].Actions.push(tempMockAction);
    //    tempMockPatrolInstance.Points[0].Actions.push(tempMockAction);
    //    tempMockPatrolInstance.Points[0].Actions.push(tempMockAction);
    //    fixture = TestBed.createComponent(PatrolOverview);
    //    fixture.componentInstance.patrolInstance = tempMockPatrolInstance;
    //    fixture.componentInstance.platform = mockPlatform;
    //    // Act
    //    fixture.componentInstance.toggleExpandedActionView(tempMockPatrolInstance.Points[0].PointId);
    //    fixture.detectChanges();
    //    // Assert
    //    let $actionItems = $(fixture.nativeElement).find('.action-item');
    //    $.each($actionItems, (index) => {
    //        expect($actionItems[index].innerText).toContain(($actionItems.length - parseInt(index)).toString());
    //    });
    //});
    //it('should display actions in asc order', () => {
    //    // Arrange
    //    let tempMockPatrolInstance = new PatrolInstance(mockPatrolInstance);
    //    let tempMockAction = new ActionInstance(mockAction);
    //    tempMockAction.CurrentStatus = ActionStatusValues.Completed;
    //    tempMockPatrolInstance.Points[0].CurrentStatus = PointStatusValues.ActionsPerformed;
    //    tempMockPatrolInstance.Points[0].Actions.push(tempMockAction);
    //    tempMockPatrolInstance.Points[0].Actions.push(tempMockAction);
    //    tempMockPatrolInstance.Points[0].Actions.push(tempMockAction);
    //    tempMockPatrolInstance.Points[0].Actions.push(tempMockAction);
    //    fixture = TestBed.createComponent(PatrolOverview);
    //    fixture.componentInstance.patrolInstance = tempMockPatrolInstance;
    //    fixture.componentInstance.platform = mockPlatform;
    //    // Act
    //    fixture.componentInstance.toggleExpandedActionView(tempMockPatrolInstance.Points[0].PointId);
    //    fixture.componentInstance.toggleSort();
    //    fixture.detectChanges();
    //    // Assert
    //    let $actionItems = $(fixture.nativeElement).find('.action-item');
    //    $.each($actionItems, (index) => {
    //        expect($actionItems[index].innerText).toContain((index + 1).toString());
    //    });
    //});
    //it('should return the correct border class', () => {
    //    // Arrange
    //    let tempMockPatrolInstance = new PatrolInstance(mockPatrolInstance);
    //    let tempMockAction = new ActionInstance(mockAction);
    //    tempMockAction.CurrentStatus = ActionStatusValues.Completed;
    //    tempMockPatrolInstance.Points[0].Actions.push(tempMockAction);
    //    tempMockPatrolInstance.Points[0].Actions.push(tempMockAction);
    //    tempMockPatrolInstance.Points[0].Actions.push(tempMockAction);
    //    tempMockPatrolInstance.Points[0].Actions.push(tempMockAction);
    //    fixture = TestBed.createComponent(PatrolOverview);
    //    fixture.componentInstance.patrolInstance = tempMockPatrolInstance;
    //    fixture.componentInstance.platform = mockPlatform;
    //    // Act // Assert
    //    tempMockPatrolInstance.Points[0].CurrentStatus = PointStatusValues.NotReached;
    //    fixture.detectChanges();
    //    expect(fixture.componentInstance.getPointBorderClass(tempMockPatrolInstance.Points[0])).toBe('dashed-line');
    //    tempMockPatrolInstance.Points[0].CurrentStatus = PointStatusValues.InTransit;
    //    fixture.detectChanges();
    //    expect(fixture.componentInstance.getPointBorderClass(tempMockPatrolInstance.Points[0])).toBe('dashed-line');
    //    tempMockPatrolInstance.Points[0].CurrentStatus = PointStatusValues.Reached;
    //    fixture.detectChanges();
    //    expect(fixture.componentInstance.getPointBorderClass(tempMockPatrolInstance.Points[0])).toBe('solid-line');
    //    tempMockPatrolInstance.Points[0].CurrentStatus = PointStatusValues.ActionsPerformed;
    //    fixture.detectChanges();
    //    expect(fixture.componentInstance.getPointBorderClass(tempMockPatrolInstance.Points[0])).toBe('solid-line');
    //});
});
var mockAction = new ActionInstance({
    "CurrentStatus": 0,
    "StatusHistory": null,
    "AlarmIds": null,
    "Image": null,
    "ActionId": "b1d4ba80-f5b9-4cf8-b6a2-22deb600c9ea",
    "Command": 26,
    "Parameters": [
        {
            "Name": 5,
            "Value": "3",
            "Type": 0
        }
    ]
});
var mockPlatform = new Platform({
    "DisplayName": "RAMSEE 1",
    "PlatformType": "Ground",
    "Position": {
        "coordinates": [
            -105.074991,
            39.649991
        ],
        "type": "Point"
    },
    "Sensors": [
        {
            "Type": 1,
            "Name": "TemperatureSensor",
            "DisplayName": "Temperature",
            "Values": [
                {
                    "Name": "TemperatureSensor",
                    "DisplayName": "Temperature",
                    "BooleanValue": null,
                    "StringValue": null,
                    "IntValue": null,
                    "DoubleValue": null,
                    "ImageValue": null
                }
            ]
        },
        {
            "Type": 6,
            "Name": "HumiditySensor",
            "DisplayName": "Humidity",
            "Values": [
                {
                    "Name": "HumiditySensor",
                    "DisplayName": "Humidity",
                    "BooleanValue": null,
                    "StringValue": null,
                    "IntValue": null,
                    "DoubleValue": null,
                    "ImageValue": null
                }
            ]
        },
        {
            "Type": 2,
            "Name": "GasSensor",
            "DisplayName": "Gas",
            "Values": [
                {
                    "Name": "GasSensor",
                    "DisplayName": "Gas",
                    "BooleanValue": null,
                    "StringValue": null,
                    "IntValue": null,
                    "DoubleValue": null,
                    "ImageValue": null
                }
            ]
        },
        {
            "Type": 9,
            "Name": "FLIRSensor",
            "DisplayName": "FLIR",
            "Values": [
                {
                    "Name": "FLIRSensor",
                    "DisplayName": "High",
                    "BooleanValue": null,
                    "StringValue": null,
                    "IntValue": null,
                    "DoubleValue": null,
                    "ImageValue": null
                },
                {
                    "Name": "FLIRSensor",
                    "DisplayName": "Low",
                    "BooleanValue": null,
                    "StringValue": null,
                    "IntValue": null,
                    "DoubleValue": null,
                    "ImageValue": null
                }
            ]
        }
    ],
    "Configuration": null,
    "Commands": [
        {
            "CommandName": 0,
            "DisplayName": "E-Stop",
            "Description": "Stop Robot",
            "Category": "Robot Navigation",
            "Prompt": null,
            "Parameters": null,
            "ActionType": 0,
            "ActionScope": 1,
            "IsQuickAction": true
        },
        {
            "CommandName": 1,
            "DisplayName": "E-Stop Reset",
            "Description": "Release Stop",
            "Category": "Robot Navigation",
            "Prompt": null,
            "Parameters": null,
            "ActionType": 0,
            "ActionScope": 1,
            "IsQuickAction": true
        },
        {
            "CommandName": 24,
            "DisplayName": "Go to Location",
            "Description": "Send the robot to a specified map location",
            "Category": "Robot Navigation",
            "Prompt": null,
            "Parameters": null,
            "ActionType": 0,
            "ActionScope": 1,
            "IsQuickAction": true
        },
        {
            "CommandName": 4,
            "DisplayName": "Go Charge",
            "Description": "Send robot to its charging station",
            "Category": "Robot Navigation",
            "Prompt": null,
            "Parameters": null,
            "ActionType": 0,
            "ActionScope": 0,
            "IsQuickAction": true
        },
        {
            "CommandName": 20,
            "DisplayName": "Orient",
            "Description": "Orient the robot",
            "Category": "Robot Navigation",
            "Prompt": "Choose which way you want RAMSEE 1  to face.",
            "Parameters": [
                {
                    "Name": 2,
                    "DisplayName": "Degrees",
                    "Type": 1,
                    "Prompt": null,
                    "Presets": [
                        {
                            "Name": "North",
                            "DisplayName": "North",
                            "BooleanValue": null,
                            "StringValue": "0",
                            "IntValue": 0,
                            "DoubleValue": null,
                            "ImageValue": null
                        },
                        {
                            "Name": "South",
                            "DisplayName": "South",
                            "BooleanValue": null,
                            "StringValue": "180",
                            "IntValue": 180,
                            "DoubleValue": null,
                            "ImageValue": null
                        },
                        {
                            "Name": "East",
                            "DisplayName": "East",
                            "BooleanValue": null,
                            "StringValue": "90",
                            "IntValue": 90,
                            "DoubleValue": null,
                            "ImageValue": null
                        },
                        {
                            "Name": "West",
                            "DisplayName": "East",
                            "BooleanValue": null,
                            "StringValue": "270",
                            "IntValue": 270,
                            "DoubleValue": null,
                            "ImageValue": null
                        }
                    ]
                }
            ],
            "ActionType": 5,
            "ActionScope": 0,
            "IsQuickAction": true
        },
        {
            "CommandName": 23,
            "DisplayName": "Play Audio",
            "Description": "Play an audio file through the sound system",
            "Category": "Sounds",
            "Prompt": "Choose a file",
            "Parameters": [
                {
                    "Name": 4,
                    "DisplayName": "Filename",
                    "Type": 0,
                    "Prompt": null,
                    "Presets": [
                        {
                            "Name": "bird",
                            "DisplayName": "bird",
                            "BooleanValue": null,
                            "StringValue": "bird",
                            "IntValue": null,
                            "DoubleValue": null,
                            "ImageValue": null
                        },
                        {
                            "Name": "caruso",
                            "DisplayName": "caruso",
                            "BooleanValue": null,
                            "StringValue": "caruso",
                            "IntValue": null,
                            "DoubleValue": null,
                            "ImageValue": null
                        },
                        {
                            "Name": "cat",
                            "DisplayName": "cat",
                            "BooleanValue": null,
                            "StringValue": "cat",
                            "IntValue": null,
                            "DoubleValue": null,
                            "ImageValue": null
                        },
                        {
                            "Name": "chicken",
                            "DisplayName": "chicken",
                            "BooleanValue": null,
                            "StringValue": "chicken",
                            "IntValue": null,
                            "DoubleValue": null,
                            "ImageValue": null
                        },
                        {
                            "Name": "crickets",
                            "DisplayName": "crickets",
                            "BooleanValue": null,
                            "StringValue": "crickets",
                            "IntValue": null,
                            "DoubleValue": null,
                            "ImageValue": null
                        },
                        {
                            "Name": "dog",
                            "DisplayName": "dog",
                            "BooleanValue": null,
                            "StringValue": "dog",
                            "IntValue": null,
                            "DoubleValue": null,
                            "ImageValue": null
                        },
                        {
                            "Name": "dolphin",
                            "DisplayName": "dolphin",
                            "BooleanValue": null,
                            "StringValue": "dolphin",
                            "IntValue": null,
                            "DoubleValue": null,
                            "ImageValue": null
                        },
                        {
                            "Name": "easy",
                            "DisplayName": "easy",
                            "BooleanValue": null,
                            "StringValue": "easy",
                            "IntValue": null,
                            "DoubleValue": null,
                            "ImageValue": null
                        },
                        {
                            "Name": "frog",
                            "DisplayName": "frog",
                            "BooleanValue": null,
                            "StringValue": "frog",
                            "IntValue": null,
                            "DoubleValue": null,
                            "ImageValue": null
                        },
                        {
                            "Name": "goat",
                            "DisplayName": "goat",
                            "BooleanValue": null,
                            "StringValue": "goat",
                            "IntValue": null,
                            "DoubleValue": null,
                            "ImageValue": null
                        },
                        {
                            "Name": "gong",
                            "DisplayName": "gong",
                            "BooleanValue": null,
                            "StringValue": "gong",
                            "IntValue": null,
                            "DoubleValue": null,
                            "ImageValue": null
                        },
                        {
                            "Name": "peacock",
                            "DisplayName": "peacock",
                            "BooleanValue": null,
                            "StringValue": "peacock",
                            "IntValue": null,
                            "DoubleValue": null,
                            "ImageValue": null
                        },
                        {
                            "Name": "tiger",
                            "DisplayName": "tiger",
                            "BooleanValue": null,
                            "StringValue": "tiger",
                            "IntValue": null,
                            "DoubleValue": null,
                            "ImageValue": null
                        }
                    ]
                }
            ],
            "ActionType": 4,
            "ActionScope": 0,
            "IsQuickAction": true
        },
        {
            "CommandName": 12,
            "DisplayName": "Say Message",
            "Description": "Say a message through the sound system",
            "Category": "Sounds",
            "Prompt": "Enter custom message for RAMSEE 1  to say",
            "Parameters": [
                {
                    "Name": 0,
                    "DisplayName": "Phrase",
                    "Type": 0,
                    "Prompt": null,
                    "Presets": [
                        {
                            "Name": "Hello",
                            "DisplayName": "Hello, my name is Ramsee. I am the new face of security. I am pleased to meet you. Welcome to Hexagon Live.",
                            "BooleanValue": null,
                            "StringValue": "Hello, my name is Ramsee. I am the new face of security. I am pleased to meet you. Welcome to Hexagon Live.",
                            "IntValue": null,
                            "DoubleValue": null,
                            "ImageValue": null
                        },
                        {
                            "Name": "Selfie",
                            "DisplayName": "I would love to take a selfie with you. It will only cost 5 dollars. Just kidding. Ha. Ha. Ha.  Please feel free to take my picture as many times as you would like.  Please post one on the Hexagon Facebook page.",
                            "BooleanValue": null,
                            "StringValue": "I would love to take a selfie with you. It will only cost 5 dollars. Just kidding. Ha. Ha. Ha.  Please feel free to take my picture as many times as you would like.  Please post one on the Hexagon Facebook page.",
                            "IntValue": null,
                            "DoubleValue": null,
                            "ImageValue": null
                        },
                        {
                            "Name": "LasVegas",
                            "DisplayName": "I have heard what happens in Las Vegas stays in Las Vegas but I am programmed to see and record everything so be good and do not forget to call your mother.",
                            "BooleanValue": null,
                            "StringValue": "I have heard what happens in Las Vegas stays in Las Vegas but I am programmed to see and record everything so be good and do not forget to call your mother.",
                            "IntValue": null,
                            "DoubleValue": null,
                            "ImageValue": null
                        },
                        {
                            "Name": "SlotMachine",
                            "DisplayName": "I am very pleased to meet you. I hope you have a great time in Las Vegas. Just so you know, I am a security robot but I also double as a slot machine.  Please put a twenty in my slot and pull my arm.  Thank you for your contribution.",
                            "BooleanValue": null,
                            "StringValue": "I am very pleased to meet you. I hope you have a great time in Las Vegas. Just so you know, I am a security robot but I also double as a slot machine.  Please put a twenty in my slot and pull my arm.  Thank you for your contribution.",
                            "IntValue": null,
                            "DoubleValue": null,
                            "ImageValue": null
                        },
                        {
                            "Name": "Hide",
                            "DisplayName": "I am able to sense heat, cold, humidity, and gas. I am also able to see in total darkness so hiding under your bed will not work. I will find you.",
                            "BooleanValue": null,
                            "StringValue": "I am able to sense heat, cold, humidity, and gas. I am also able to see in total darkness so hiding under your bed will not work. I will find you.",
                            "IntValue": null,
                            "DoubleValue": null,
                            "ImageValue": null
                        },
                        {
                            "Name": "Headlights",
                            "DisplayName": "I use many different sensors to scan my environment and to communicate. I can see in 360 degrees and even in total darkness. I also have flashers and a siren. How do you like my headlights?",
                            "BooleanValue": null,
                            "StringValue": "I use many different sensors to scan my environment and to communicate. I can see in 360 degrees and even in total darkness. I also have flashers and a siren. How do you like my headlights?",
                            "IntValue": null,
                            "DoubleValue": null,
                            "ImageValue": null
                        }
                    ]
                }
            ],
            "ActionType": 3,
            "ActionScope": 0,
            "IsQuickAction": true
        },
        {
            "CommandName": 15,
            "DisplayName": "Siren On",
            "Description": "Turn siren on",
            "Category": "Sounds",
            "Prompt": null,
            "Parameters": null,
            "ActionType": 0,
            "ActionScope": 0,
            "IsQuickAction": true
        },
        {
            "CommandName": 14,
            "DisplayName": "Siren Off",
            "Description": "Turn siren off",
            "Category": "Sounds",
            "Prompt": null,
            "Parameters": null,
            "ActionType": 0,
            "ActionScope": 0,
            "IsQuickAction": true
        },
        {
            "CommandName": 3,
            "DisplayName": "Flashers On",
            "Description": "Turn flashers on",
            "Category": "Lights",
            "Prompt": null,
            "Parameters": null,
            "ActionType": 0,
            "ActionScope": 0,
            "IsQuickAction": true
        },
        {
            "CommandName": 2,
            "DisplayName": "Flashers Off",
            "Description": "Turn flashers off",
            "Category": "Lights",
            "Prompt": null,
            "Parameters": null,
            "ActionType": 0,
            "ActionScope": 0,
            "IsQuickAction": true
        },
        {
            "CommandName": 7,
            "DisplayName": "Headlights On",
            "Description": "Turn headlights on",
            "Category": "Lights",
            "Prompt": null,
            "Parameters": null,
            "ActionType": 0,
            "ActionScope": 0,
            "IsQuickAction": true
        },
        {
            "CommandName": 6,
            "DisplayName": "Headlights Off",
            "Description": "Turn headlights off",
            "Category": "Lights",
            "Prompt": null,
            "Parameters": null,
            "ActionType": 0,
            "ActionScope": 0,
            "IsQuickAction": true
        },
        {
            "CommandName": 9,
            "DisplayName": "I/R Illuminators On",
            "Description": "Turn I/R Illuminators On",
            "Category": "Lights",
            "Prompt": null,
            "Parameters": null,
            "ActionType": 0,
            "ActionScope": 0,
            "IsQuickAction": true
        },
        {
            "CommandName": 8,
            "DisplayName": "I/R Illuminators Off",
            "Description": "Turn I/R Illuminators Off",
            "Category": "Lights",
            "Prompt": null,
            "Parameters": null,
            "ActionType": 0,
            "ActionScope": 0,
            "IsQuickAction": true
        },
        {
            "CommandName": 10,
            "DisplayName": "Robot at Charger",
            "Description": "Sets the robot's position to the charger's location",
            "Category": "Charger",
            "Prompt": null,
            "Parameters": null,
            "ActionType": 0,
            "ActionScope": 1,
            "IsQuickAction": false
        },
        {
            "CommandName": 13,
            "DisplayName": "Set Charger Location",
            "Description": "Set the robot's charger location",
            "Category": "Charger",
            "Prompt": null,
            "Parameters": null,
            "ActionType": 0,
            "ActionScope": 1,
            "IsQuickAction": false
        },
        {
            "CommandName": 19,
            "DisplayName": "Set Volume Level",
            "Description": "Set volume level percentage",
            "Category": "Sounds",
            "Prompt": "Set the volume level for RAMSEE 1 's audio.",
            "Parameters": [
                {
                    "Name": 1,
                    "DisplayName": "Percentage",
                    "Type": 2,
                    "Prompt": null,
                    "Presets": null
                }
            ],
            "ActionType": 0,
            "ActionScope": 0,
            "IsQuickAction": true
        },
        {
            "CommandName": 17,
            "DisplayName": "Mute Volume",
            "Description": "Disable sound system",
            "Category": "Sounds",
            "Prompt": null,
            "Parameters": null,
            "ActionType": 0,
            "ActionScope": 0,
            "IsQuickAction": true
        },
        {
            "CommandName": 18,
            "DisplayName": "Unmute Volume",
            "Description": "Enable sound system",
            "Category": "Sounds",
            "Prompt": null,
            "Parameters": null,
            "ActionType": 0,
            "ActionScope": 0,
            "IsQuickAction": true
        }
    ],
    "Cameras": [
        {
            "Username": null,
            "Password": null,
            "Port": null,
            "Ip": null,
            "Uri": "http://10.8.0.226/jpeg/1/jpeg.php  ",
            "Id": null,
            "DisplayName": "PTZ Camera",
            "Type": "Gamma2VideoVendor",
            "IsPTZ": false,
            "Properties": null
        },
        {
            "Username": null,
            "Password": null,
            "Port": null,
            "Ip": null,
            "Uri": "http://10.8.0.218/jpeg/1/jpeg.php'",
            "Id": null,
            "DisplayName": "Front Camera",
            "Type": "Gamma2VideoVendor",
            "IsPTZ": false,
            "Properties": null
        },
        {
            "Username": null,
            "Password": null,
            "Port": null,
            "Ip": null,
            "Uri": "http://10.8.0.222/jpeg/1/jpeg.php",
            "Id": null,
            "DisplayName": "Back Camera",
            "Type": "Gamma2VideoVendor",
            "IsPTZ": false,
            "Properties": null
        }
    ],
    "Map": {
        "Name": null,
        "ExternalMapId": null,
        "MapOrigin": {
            "coordinates": [
                -105.0732862,
                39.6502869
            ],
            "type": "Point"
        },
        "MapRotation": -85,
        "HomePosition": null,
        "ChargerPosition": null
    },
    "Manufacturer": "Gamma2",
    "ModelNumber": "MN0001",
    "SerialNumber": "SN0001",
    "IsConnected": true,
    "IsReady": true,
    "IsAvailable": true,
    "IsPatrolSubmitted": false,
    "PatrolTemplateSubmittedId": null,
    "BatteryPercentage": 80,
    "State": {
        "State": 1,
        "Values": null
    },
    "Orientation": 132,
    "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
    "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
    "Version": 0,
    "id": "Gamma2Platform1"
});
var mockPatrolInstance = new PatrolInstance({
    "InstanceId": "018f0b9c-5e26-4bcb-a388-28447da91f29",
    "RunNumber": 1,
    "MaxRunNumber": 0,
    "LastUpdateTime": 1496953858774.7686,
    "SubmittedTime": 1496953772269,
    "StartedTime": 1496932181000,
    "EndedTime": 1496932253000,
    "UserName": "live.com#ricky.crow@hexagonsi.com",
    "PlatformId": "Gamma2Platform1",
    "CurrentStatus": 2,
    "StatusHistory": [
        {
            "Status": 1,
            "ReportedTime": 1496932181000
        },
        {
            "Status": 2,
            "ReportedTime": 1496932253000
        }
    ],
    "Points": [
        {
            "CurrentStatus": 2,
            "StatusHistory": [
                {
                    "Status": 1,
                    "ReportedTime": 1496932181000
                },
                {
                    "Status": 2,
                    "ReportedTime": 1496932197000
                },
                {
                    "Status": 2,
                    "ReportedTime": 1496932197000
                }
            ],
            "Actions": [],
            "AlarmIds": null,
            "Telemetry": null,
            "PointId": "37be6939-2f91-4517-b8a3-2814b7721df1",
            "DisplayName": "Point 1",
            "Ordinal": 1,
            "Description": null,
            "Position": {
                "coordinates": [
                    -105.07318653166296,
                    39.650303647176194
                ],
                "type": "Point"
            }
        },
        {
            "CurrentStatus": 2,
            "StatusHistory": [
                {
                    "Status": 1,
                    "ReportedTime": 1496932197000
                },
                {
                    "Status": 2,
                    "ReportedTime": 1496932220000
                }
            ],
            "Actions": [],
            "AlarmIds": null,
            "Telemetry": null,
            "PointId": "e6910174-6197-435f-976c-e13a876229e0",
            "DisplayName": "Point 2",
            "Ordinal": 2,
            "Description": null,
            "Position": {
                "coordinates": [
                    -105.07311914116146,
                    39.65030338902922
                ],
                "type": "Point"
            }
        },
        {
            "CurrentStatus": 2,
            "StatusHistory": [
                {
                    "Status": 1,
                    "ReportedTime": 1496932220000
                },
                {
                    "Status": 1,
                    "ReportedTime": 1496932220000
                },
                {
                    "Status": 2,
                    "ReportedTime": 1496932228000
                },
                {
                    "Status": 2,
                    "ReportedTime": 1496932228000
                }
            ],
            "Actions": [],
            "AlarmIds": null,
            "Telemetry": null,
            "PointId": "a5aa5fdc-3bc0-4548-95f8-1860b5485472",
            "DisplayName": "Point 3",
            "Ordinal": 3,
            "Description": null,
            "Position": {
                "coordinates": [
                    -105.07310640066864,
                    39.65028686762152
                ],
                "type": "Point"
            }
        },
        {
            "CurrentStatus": 2,
            "StatusHistory": [
                {
                    "Status": 1,
                    "ReportedTime": 1496932228000
                },
                {
                    "Status": 2,
                    "ReportedTime": 1496932237000
                }
            ],
            "Actions": [],
            "AlarmIds": null,
            "Telemetry": null,
            "PointId": "758f77e8-54b9-4da7-9485-d2c2c3ad09ff",
            "DisplayName": "Point 4",
            "Ordinal": 4,
            "Description": null,
            "Position": {
                "coordinates": [
                    -105.07313255220654,
                    39.65028273726896
                ],
                "type": "Point"
            }
        },
        {
            "CurrentStatus": 2,
            "StatusHistory": [
                {
                    "Status": 1,
                    "ReportedTime": 1496932237000
                },
                {
                    "Status": 1,
                    "ReportedTime": 1496932237000
                },
                {
                    "Status": 2,
                    "ReportedTime": 1496932253000
                }
            ],
            "Actions": [],
            "AlarmIds": null,
            "Telemetry": null,
            "PointId": "766aa45e-356b-45c3-ba37-9e508b80e280",
            "DisplayName": "Point 5",
            "Ordinal": 5,
            "Description": null,
            "Position": {
                "coordinates": [
                    -105.07318720221522,
                    39.65028609318042
                ],
                "type": "Point"
            }
        }
    ],
    "AlarmIds": null,
    "TemplateId": "018f0b9c-5e26-4bcb-a388-28447da91f29",
    "DisplayName": "rpc",
    "Description": null,
    "Type": 0,
    "IsTemplate": false,
    "IsDeleted": false,
    "AreaType": 2,
    "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
    "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
    "Version": 0,
    "id": "5c3a6aab-3725-4b2a-a577-6ad95c3adb66"
});
//# sourceMappingURL=patrol-overview.component.spec.js.map