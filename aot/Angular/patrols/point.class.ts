import { ActionInstance, ActionBase } from './action.class';
import { Sensor, Position } from '../shared/shared-interfaces';
import * as moment from 'moment';

export interface PointStatus {
	Status: PointStatusValues;
	ReportedTime: Number;
}

export enum PointStatusValues {
	Unknown = 0,
	InTransit = 1,
	Reached = 2,
	NotReached = 3,
	ActionsPerformed = 4,
	Cancelled = 5
}

export class PointBase implements Serializable<PointBase> {
	public PointId: string;
	public DisplayName: string;
	public Description: string;
	public Ordinal: number;
    public Position: Position;

	public Selected: boolean = false;
	public IsInserted: boolean = false;
	public ActionsExpanded: boolean = false;

	constructor(pointbase: any) {
		if (pointbase != null)
			this.deserialize(pointbase);
	}

	deserialize(input: any) {
		this.PointId = input.PointId;
		this.DisplayName = input.DisplayName;
		this.Description = input.Description;
		this.Ordinal = input.Ordinal;
		if (input.Position.Coordinates != null)
			this.Position = input.Position ? { Coordinates: input.Position.Coordinates, Type: input.Position.Type } : null;
		else
			this.Position = input.Position ? { Coordinates: input.Position.coordinates, Type: input.Position.type } : null;
		return this;
	}
}
//Type Guard
export function isPointTemplate(arg: any): arg is PointInstance {
    return  arg.AlarmIds === undefined;
}
export class PointTemplate extends PointBase implements Serializable<PointTemplate> {
	public Actions: ActionBase[] = [];

	constructor(point: any) {
		super(null);
        if (point != null) {
            this.deserialize(point);
        }
	}

	deserialize(input: any) {

		super.deserialize(input);
		if (input.Actions) {
			this.Actions = [];
			for (let ii = 0; ii < input.Actions.length; ii++) {
				let action = new ActionBase(input.Actions[ii]);
				this.Actions.push(action);
			}

		}

		return this;
	}
}

//Type Guard
export function isPointInstance(arg: any): arg is PointInstance {
    return arg.CurrentStatus !== undefined;
}

export class PointInstance extends PointBase implements Serializable<PointInstance> {
	public CurrentStatus: PointStatusValues;
	public StatusHistory: PointStatus[];
	public Actions: ActionInstance[];
	public AlarmIds: string[];
	public Telemetry: Sensor[];

	constructor(point: any) {
        super(null);
        if (point) {
            this.deserialize(point);
        }
	}

    deserialize(input: any) {
		super.deserialize(input);
		this.CurrentStatus = input.CurrentStatus;
		this.StatusHistory = input.StatusHistory;

        if (!this.Actions) {
            this.Actions = [];
		}
       
        if (input.Actions) {
            //Create lookup
            let actionLookup: Map<string, number> = new Map<string, number>();
            for (let lookupAction in this.Actions) {
                actionLookup.set(this.Actions[lookupAction].ActionId, parseInt(lookupAction));
            }

            for (let action of input.Actions) {
                if (actionLookup.has(action.ActionId)) {
                    this.Actions[actionLookup.get(action.ActionId)].deserialize(action);
                } else {
                    this.Actions.push(new ActionInstance(action));
                }
            }
        }

		this.AlarmIds = input.AlarmIds;
		this.Telemetry = input.Telemetry;

		return this;
	}
}