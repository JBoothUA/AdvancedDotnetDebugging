import { Alarm } from '../alarms/alarm.class';
import { PatrolInstance } from '../patrols/patrol.class';
import { DataValue, BaseDataObject, Sensor, PlatformPosition, SensorType } from '../shared/shared-interfaces';
import { CommandDefinition } from '../patrols/action.class';
import { PointInstance } from '../patrols/point.class';
import * as moment from 'moment';

export interface PlatformConfiguration {
	PlatformItems: ConfigurationItem[];
	AlarmItems: ConfigurationItem[];
}

export interface ConfigurationItem {
	Name: string;
	Values: DataValue[];
}

export interface PlatformMap {
	Name: string;
	ExternalMapId: string;
	MapOrigin: any;
	MapRotation: number;
	HomePosition: any;
	ChargerPosition: any;
}

export enum PlatformMode {
    Unknown = 0,
    Inactive = 1,
    Offline = 2,
    Error = 3,
    Estop = 4,
    EstopPhysical = 5,
    Docking = 6,
    MandatoryCharge = 7,
    Charging = 8,
    Charged = 9,
    Healthy = 10
}

export enum PlatformMessageType{
    Full = 0,
    AMCLPos = 1,
    Sensor = 2
}

export enum ErrorState {
    Unknown = 0,
    SystemCommunication = 1,
    GatewayCommunication = 2,
    PlatformCommunication = 3,
    Lost = 4,
    HardwareSoftware = 5,
    DockingError = 6,
    None = 7,
    MapConfiguration = 8,
    DropoffDetected = 9
}

export class PlatformState {
    PlatformMode: PlatformMode;
    Values: DataValue[];
    ErrorState: ErrorState;
}

export class Camera implements Serializable<Camera> {
    public Username: string;
    public Password: string;
    public Port: string;
    public Ip: string;
    public Uri: any;
    public Id: string;
    public DisplayName: string;
    public Type: string;
    public IsPTZ: boolean;

    constructor(camera: object) {
        if (camera)
            this.deserialize(camera);
    }

    deserialize(input: any): Camera {
        this.Username = input.Username;
        this.Password = input.Password;
        this.Port = input.Port;
        this.Ip = input.Ip;
        this.Uri = input.Uri;
        this.Id = input.Id;
        this.DisplayName = input.DisplayName;
        this.Type = input.Type;
        this.IsPTZ = input.IsPtz;

        return this;
    }
}

export interface ParameterInstance {
	Name: string;
	Value: DataValue;
}

export interface CommandInstance {
	PlatformId: string;
	Name: string;
	Parameters: ParameterInstance[];
}

export class Platform implements Serializable<Platform> {
	//Configuration
	public id: string;
	public DisplayName: string;
	public PlatformType: string;
	public Position: PlatformPosition;
	public SentToPosition: PointInstance;
	public Orientation: number;
	public Sensors: Sensor[];
	public Configuration: PlatformConfiguration;
	public Commands: CommandDefinition[] = [];
	public Cameras: Camera[] = [];
    public Map: PlatformMap;
    public TenantId: string;
    public Version: number;
    public LocationId: string;
    public LastPositionUpdate: Date;
    public PlatformMessageType: PlatformMessageType 
    
	//Platform-specific mfg information
	public Manufacturer: string;
	public ModelNumber: string;
	public SerialNumber: string;

	//Platform Status
    public IsPatrolSubmitted: boolean;
    public PatrolTemplateSubmittedId: string;
	public BatteryPercentage: number;
	public State: PlatformState;

	public Patrol: PatrolInstance;
	public Alarms: Alarm[];

	Selected: boolean;
	Expanded: boolean;
	ExpandedRobotSensors: string;
	ExpandedActiveAlarms: string;
	ShowMoreCommands: boolean;

    constructor(platform: any) {
		this.deserialize(platform, true);

        this.Selected = false;
        this.Expanded = false;
        this.ShowMoreCommands = false;
    }

    hasSensorData(sensor: Sensor): boolean {
        if (sensor && sensor.Values) {
            for (let value of sensor.Values) {
                if (value.BooleanValue)
                    return true;
                if (value.DoubleValue) {
                    return true;
                }
                if (value.IntValue)
                    return true;
                if (value.StringValue)
                    return true;
                if (value.ImageValue)
                    return true;
            }
        }

        return false;
    }

    getLocalTime(dateTime: string): any {
        if (dateTime) {
            let time = moment(dateTime);
            if(time.format('YYYY') === '0001'){
                return null;
            }

            let timestamp = time.isUtc() ? moment.utc(dateTime).local().format('YYYY-MM-DD HH:mm:ss')
                                         : time.format('YYYY-MM-DD HH:mm:ss');

            return timestamp;
        } else {
            return null;
        }
    }

    deserializeAMCLPos(input: any, isCreated: boolean = false) {
        if (input.Position) {
            this.Position = input.Position;
        }

        if (input.LastPositionUpdate) {
            this.LastPositionUpdate = this.getLocalTime(input.LastPositionUpdate);
        }

        if (input.Orientation) {
            this.Orientation = input.Orientation;
        }
    }

    deserializeSensor(input: any, isCreated: boolean = false){
        if (input.Sensors) {
            if (isCreated) {
                this.Sensors = input.Sensors;
            } else {
                if (this.Sensors) {
                    for (let inputSensor of input.Sensors as Sensor[]) {
                        if (inputSensor.Values) {
                            let found = false;
                            for (let sensor in this.Sensors) {
                                if (this.Sensors[sensor].Name === inputSensor.Name) {
                                    if (this.hasSensorData(inputSensor)) {
                                        for (let value in this.Sensors[sensor].Values) {
                                            if (inputSensor.Values[value] && !inputSensor.Values[value].ImageValue) {
                                                this.Sensors[sensor].Values[value].BooleanValue = inputSensor.Values[value].BooleanValue;
                                                this.Sensors[sensor].Values[value].StringValue = inputSensor.Values[value].StringValue;
                                                this.Sensors[sensor].Values[value].IntValue = inputSensor.Values[value].IntValue;
                                                this.Sensors[sensor].Values[value].DoubleValue = inputSensor.Values[value].DoubleValue;
                                            } else if (inputSensor.Values[value] && inputSensor.Values[value].ImageValue) {
                                                this.Sensors[sensor].Values[value].ImageValue = inputSensor.Values[value].ImageValue;
                                            }
                                        }
                                    }
                                    found = true;
                                    break;
                                }
                            }

                            if (!found) {
                                this.Sensors.push(inputSensor);
                            }
                        }
                    }
                } else {
                    this.Sensors = input.Sensors;
                }
            }
        }
    }

    deserialize(input: any, isCreated: boolean = false) {
        if(input.PlatformMessageType){
            this.PlatformMessageType = input.PlatformMessageType;
        } else{
            this.PlatformMessageType = PlatformMessageType.Full;
        }

        if (this.PlatformMessageType === PlatformMessageType.Full) {
            if (input.DisplayName) {
                for (let property in input) {
                    if (property !== 'Sensors'
                        && property !== 'Position'
                        && property !== 'Orientation'
                        && property !== 'BatteryPercentage'
                        && property != 'LastPositionUpdate'
                        && property != 'PlatformMessageType') {
                        if (input.hasOwnProperty(property)) {
                            this[property] = input[property];
                        }
                    }
                }

                this.IsPatrolSubmitted = (input.PatrolTemplateSubmittedId) ? true : false;
            }
            if (input.SentToPosition) {
                this.SentToPosition = input.SentToPosition;
                // Workaround: We have some horrible logic with .Coordinates vs .coordinates
                if (input.SentToPosition.Position) {
                    this.SentToPosition.Position.Coordinates = input.SentToPosition.Position.Coordinates
                        || input.SentToPosition.Position.coordinates;
                }
            }

            if (input.BatteryPercentage && input.BatteryPercentage !== -1) {
                this.BatteryPercentage = input.BatteryPercentage;
            }
        }

        if (this.PlatformMessageType === PlatformMessageType.Full || this.PlatformMessageType === PlatformMessageType.AMCLPos) {
            this.deserializeAMCLPos(input, isCreated);
        }

        if (this.PlatformMessageType === PlatformMessageType.Full || this.PlatformMessageType === PlatformMessageType.Sensor) {
            this.deserializeSensor(input, isCreated);
        }

        return this;
    }
}