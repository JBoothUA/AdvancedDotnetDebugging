var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PlatformService } from '../../platforms/platform.service';
import { Platform } from '../../platforms/platform.class';
import { Injectable } from '@angular/core';
var MockPlatformService = /** @class */ (function (_super) {
    __extends(MockPlatformService, _super);
    function MockPlatformService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.platform1 = new Platform({
            "DisplayName": "RAMSEE 1",
            "PlatformType": "Ground",
            "Position": {
                "coordinates": [
                    -105.07309,
                    39.650294
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
                    "IsQuickAction": false
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
                    "IsQuickAction": false
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
                    "IsQuickAction": false
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
                    "IsQuickAction": false
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
                    "IsQuickAction": false
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
                    "IsQuickAction": false
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
                    "IsQuickAction": false
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
                    "IsQuickAction": false
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
                    "IsQuickAction": false
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
                    "IsQuickAction": false
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
                    "IsQuickAction": false
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
                    "IsQuickAction": false
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
                    "IsQuickAction": false
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
            "BatteryPercentage": 80,
            "State": {
                "CommunicationState": 0,
                "PlatformMode": 0,
                "DockingState": 0,
                "PatrolState": 0,
                "AlarmState": 0,
                "ServiceMode": 0,
                "Values": null
            },
            "Orientation": 268,
            "TenantId": "0f2f363b-a2fb-4ced-a9a4-54510a1a67ce",
            "LocationId": "c093abb5-58be-410b-80bf-ca7a52e52ac3",
            "Version": 0,
            "id": "Gamma2Platform1"
        });
        _this.platforms = [_this.platform1];
        return _this;
    }
    MockPlatformService = __decorate([
        Injectable()
    ], MockPlatformService);
    return MockPlatformService;
}(PlatformService));
export { MockPlatformService };
//# sourceMappingURL=mockPlatform.service.js.map