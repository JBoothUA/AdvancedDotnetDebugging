import { DataValue, Image } from './../shared/shared-interfaces';
import * as moment from 'moment';

export enum CommandName {
	EStop = 0,
	EStopReset = 1,
	FlashersOff = 2,
	FlashersOn = 3,
	GoCharge = 4,
	GoHome = 5,
	HeadlightsOff = 6,
	HeadlightsOn = 7,
	IrIlluminatorsOff = 8,
	IrIlluminatorsOn = 9,
	LocalizeOnCharger = 10,
	ResetCameras = 11,
	SayMessage = 12,
	SetChargerLocation = 13,
	SirenOff = 14,
	SirenOn = 15,
	StartRun = 16,
	VolumeMute = 17,
	VolumeUnmute = 18,
	Volume = 19,
	OrientPlatform = 20,
	TiltCameraAbsolute = 21,
	Snapshot = 22,
	Play = 23,
	GoToLocation = 24,
	Abort = 25,
    Dwell = 26,
    PausePatrol = 27,
    ResumePatrol = 28,
    CancelGoal = 29,
    GetSnapshot = 30,     // Different from Snapshot (22) -> this is to retrieve snapshot information and not to command the robot to take one
    ShutDown = 31,
    FailPatrolCommand = 32
};

export enum ActionScope {
	All,
	Command,
	PatrolAction
}

// Leaving for now until platform code is updated to use new name (ActionType)
export enum ActionCommandType {
	Command,
	Toggle,
	Dwell,
	Say,
	Play,
	Orient,
    Volume
}

export enum ActionType {
	Command,
	Toggle,
	Dwell,
	Say,
	Play,
	Orient,
    Volume
}

export enum ActionStateValue {
    On,
    Disable,
    Off
}

export interface ActionDefinitions {
	Manufacturer: string;
	PlatformType: string;
	Description: string;
	Categories: ActionCategory[];
}

export class ActionCategory {
	DisplayName: string;
	Description: string;
	ActionDefinitions: ActionDefinition[];
	ExpandedState: boolean;

}
export class ActionDefinition {
	DisplayName: string;
	Description: string;
	Category: string;
	ActionType: ActionType;
	ActionScope: ActionScope;
	Command: CommandName[];
    Parameters: ParameterDefinition[];
	Prompt: string;
	IsQuickAction: boolean;
	Selected: boolean;

	constructor() {
		this.Command = [];
		this.Parameters = [];
	}
}

export class CommandDefinition {
	DisplayName: string;
	Description: string;
	Category: string;
	ActionType: ActionType;
	ActionScope: ActionScope;
    CommandName: CommandName;
    Parameters: ParameterDefinition[];
    PlatformStateValueName: string;
    Prompt: string;
    Ordinal: number;

    IsQuickAction: boolean;
    ToggleState: boolean;
	Selected: boolean;

	constructor() {}
}


export class ParameterDefinition {
	DisplayName: string;
	Name: ParameterName;
	Type: ParameterType;
	Prompt: string;
	Presets: DataValue[];
}  

export enum ParameterName {
	Phrase = 0,
	Percent = 1,
	Angle = 2,
	Position = 3,
	File = 4,
	Seconds = 5,
	Username = 6,
	PatrolTemplateId = 7,
	PatrolInstanceId = 8,
    AlarmId = 9,
    PlatformParameter = 10,
    OriginId = 11,
    OriginType = 12,
    Camera = 13
}

export enum ParameterType {
	String,
	Double,
	Int,
	Boolean
}

export interface ActionStatus {
	Status: ActionStatusValues;
	ReportedTime: Number;
}

export enum ActionStatusValues {
	Unknown,
	Started,
	Completed,
	Failed,
	Unsupported
}

export interface Image {
	Pan: number;
	Tilt: number;
	Timestamp: Date;
	Name: string;
    Position: any;
	Uri: any;
	Starred: boolean;
}

export class Parameter implements Serializable<Parameter>{
	Name: ParameterName;
    Value: string;
	Type: ParameterType;

	constructor(parameter: any) {
        if (parameter != null)
            this.deserialize(parameter);
    }

    deserialize(input: any) {
        this.Name = input.Name;
        this.Value = input.Value;
        this.Type = input.Type;

        return this;
    }
}

export class ActionBase implements Serializable<ActionBase> {
	public ActionId: string;
	public Command: CommandName;
	public Parameters: Parameter[];
	public DirtyToggle: Boolean;

    constructor(actionbase: any) {
		if (actionbase != null)
			this.deserialize(actionbase);
	}

    deserialize(input: any) {
		this.ActionId = input.ActionId;
		this.Command = input.Command;
		//this.Parameters = input.Parameters;
		this.Parameters = [];
		if (input.Parameters) {
			for (let parameter of input.Parameters) {
				this.Parameters.push(new Parameter(parameter));
			}
		}
		return this;
	}
}
export class ActionInstance extends ActionBase implements Serializable<ActionInstance> {
	public StatusHistory: ActionStatus[];
	public AlarmIds: string[];
    public Images: Image[];
    public HasSnapshots: boolean;

    public CurrentStatus: ActionStatusValues = ActionStatusValues.Unknown;

    constructor(action: any) {
        super(null);
        if (action) {
            this.deserialize(action);
        }
	}

    deserialize(input: any) {
        super.deserialize(input);
        this.CurrentStatus = input.CurrentStatus;
		this.ActionId = input.ActionId;
		this.StatusHistory = input.StatusHistory;
		this.AlarmIds = input.AlarmIds;
        this.Images = input.Images;
        this.HasSnapshots = input.HasSnapshots;

		return this;
	}
}

export class CommandBase {
	PlatformId: string;

	constructor() { }
}

export class PlatformCommand extends CommandBase {
	Name: CommandName;
	Parameters: Parameter[];

	constructor(platformId: string, command: CommandName, parameters?: Parameter[]) {
		super();
		this.PlatformId = platformId;
		this.Name = command;
		this.Parameters = parameters;
	}
}

//TODO: remove this fallback when we are correctly processing alarm images
var tempHardcodedAlarmImages = [
    {
        'Label': '',
        'Selected': false,
        'ImageFileName': 'smoke-detected-ramsee2-frontcamera2-2017-07-11_04-28-30.jpg',
        'Timestamp': moment.utc().format('YYYY-MM-DD HH:mm:ss'),
        'Uri': '../../Content/Images/temp-SnapshotImages/smoke-detected-ramsee2-frontcamera2-2017-07-11_04-28-30.jpg'
    }
    ,
    {
        'Label': '',
        'Selected': false,
        'ImageFileName': 'smoke-detected-ramsee2-frontcamera1-2017-07-11_04-28-30.jpg',
        'Timestamp': moment.utc().format('YYYY-MM-DD HH:mm:ss'),
        'Uri': '../../Content/Images/temp-SnapshotImages/smoke-detected-ramsee2-frontcamera1-2017-07-11_04-28-30.jpg'
    },
    {
        'Label': '',
        'Selected': false,
        'ImageFileName': 'smoke-detected-ramsee2-back-camera-2017-07-11_04-28-30.jpg',
        'Timestamp': moment.utc().format('YYYY-MM-DD HH:mm:ss'),
        'Uri': '../../Content/Images/temp-SnapshotImages/smoke-detected-ramsee2-back-camera-2017-07-11_04-28-30.jpg'
    }
];