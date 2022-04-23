import { PointTemplate, PointInstance } from './point.class';

export enum AreaType {
    Large,
    Small,
    Perimeter
};

export enum PatrolType {
    Ground,
    Air
}

export enum PatrolStatusValues {
    Unknown = 0,
    Started = 1,
    Completed = 2,
    Failed = 3,
    Paused = 4,
    Resumed = 5,
    Aborted = 6,
    PointsNotReached = 7,
    FailedCheckpoints = 8,
    ImageProcessorUpdate = 9,
    FailedMostCheckpoints = 10
}

export interface PatrolStatus {
    Status: PatrolStatusValues;
    ReportedTime: number;
}

export interface RunSetData {
    RunSetId: string;
    CurrentRunNumber: number;
    TotalRunNumber: number;
    Delay: number;
    NextRun: number;
}

export class PatrolBase implements Serializable<PatrolBase> {
    public TemplateId: string;
    public DisplayName: string;
    public Description: string;
    public Type: PatrolType = PatrolType.Ground;
    public IsTemplate: boolean = true;
    public AreaType: AreaType;
    public id: string;
    public TenantId: string;
    public LocationId: string;
    public Version: number;
    public IsDeleted: boolean;
	public RunSetData: RunSetData;
	public UserName: string;
	public LastUpdateTime: number;

    public selected: boolean = false;
    public expanded: boolean = false;
    public dirtyToggle: boolean = false;

    constructor(patrolbase: any) {
        if (patrolbase !== null)
            this.deserialize(patrolbase);
    }

    deserialize(input: any) {
        this.AreaType = input.AreaType;
        this.TemplateId = input.TemplateId;
        this.DisplayName = input.DisplayName;
        this.Description = input.Description;
        this.Type = input.Type;
        this.IsTemplate = input.IsTemplate;
        this.id = input.id;
        this.TemplateId = input.TemplateId ? input.TemplateId : null;
        this.LocationId = input.LocationId ? input.LocationId : null;
        this.Version = input.Version ? input.Version : 0;
        this.IsDeleted = input.IsDeleted;
        this.TenantId = input.TenantId;
		this.RunSetData = input.RunSetData;
		this.UserName = input.UserName;
		this.LastUpdateTime = input.LastUpdateTime;

        return this;
    }
}

//Type Guard
export function isPatrolTemplate(arg: any): arg is PatrolTemplate {
    return arg.IsTemplate === true;
}
export class PatrolTemplate extends PatrolBase implements Serializable<PatrolTemplate> {
    public Points: PointTemplate[] = [];
    public LastPatrolStatus: PatrolStatusValues;
    public IsPatrolSubmitted: boolean;
    public PlatformSubmittedId: string;
    public isPatrolBuilderEdit: boolean = false;

    constructor(patrol: any) {
        super(null);
        if (patrol !== null) {
            this.deserialize(patrol);
        }
    }

    deserialize(input: any) {
        super.deserialize(input);

        this.LastPatrolStatus = input.LastPatrolStatus;
        this.IsPatrolSubmitted = (input.PlatformSubmittedId) ? true : false;
        this.PlatformSubmittedId = input.PlatformSubmittedId;

		if (!this.Points) {
            this.Points = [];
		}

		if (!input.Points || input.Points.length === 0) {
			this.Points = [];
		}
		else {
			//Create lookups
			let pointLookup: Map<string, number> = new Map<string, number>();
			for (let lookupPoint in this.Points) {
				pointLookup.set(this.Points[lookupPoint].PointId, parseInt(lookupPoint));
			}

			if (this.Points.length === 0) {
				for (let point of input.Points) {
					this.Points.push(new PointTemplate(point));
				}
			}
			else {

				// First update all the existing points and add new ones.
				let offset = 0;
				for (let point of input.Points) {
					if (pointLookup.has(point.PointId)) {
						this.Points[pointLookup.get(point.PointId) + offset].deserialize(point);
					} else {
						if (point.Ordinal === 1) {
							this.Points.unshift(point);
							offset++;
						}
						else if (point.Ordinal > this.Points.length) {
							this.Points.push(new PointTemplate(point));
						}
						else {
							this.Points.splice((point.Ordinal - 1), 0, point);
							offset++;
						}
					}
				}

				// Now check for deletes 
				pointLookup.clear();
				for (let lookupPoint in input.Points) {
					pointLookup.set(input.Points[lookupPoint].PointId, parseInt(lookupPoint));
				}

				let ii: number = this.Points.length - 1;
				while (ii > -1) {
					let point = this.Points[ii];
					if (!pointLookup.has(point.PointId)) {
						this.Points.splice(ii, 1);
					}
					ii--;
				}
			}
		}

        return this;
    }
}

//Type Guard

export function isPatrolInstance(arg: any): arg is PatrolInstance {
    return arg.IsTemplate === false;
}

export class PatrolInstance extends PatrolBase implements Serializable<PatrolInstance> {
    public InstanceId: string;
    public SubmittedTime: number;
    public StartedTime: number;
    public EndedTime: number;
    public UserName: string;
    public PlatformId: string;
    public CurrentStatus: PatrolStatusValues;
    public StatusHistory: PatrolStatus[];
    public Points: PointInstance[];
    public AlarmIds: string[];

    //UI properties
    public notficationIsPaused: boolean;

    constructor(patrol?: any) {
        super(null);
        if (patrol) {
            this.deserialize(patrol);
        }
    }

    deserialize(input: any) {
        if (input.CurrentStatus === PatrolStatusValues.ImageProcessorUpdate) {
            this.InstanceId = input.InstanceId;
            this.TemplateId = input.TemplateId;

            if (!this.Points) {
                this.Points = [];
            }
            //Create lookup
            let pointLookup: Map<string, number> = new Map<string, number>();
            for (let lookupPoint in this.Points) {
                pointLookup.set(this.Points[lookupPoint].PointId, parseInt(lookupPoint));
            }

            for (let point of input.Points) {
                if (pointLookup.has(point.PointId)) {
                    this.Points[pointLookup.get(point.PointId)].deserialize(point);
                } else {
                    this.Points.push(new PointInstance(point));
                }
            }
            return this;
        } 

        super.deserialize(input);

        this.InstanceId = input.InstanceId;
        this.SubmittedTime = input.SubmittedTime;
        this.StartedTime = input.StartedTime;
        this.EndedTime = input.EndedTime;
        this.UserName = input.UserName;
        this.PlatformId = input.PlatformId;

        if (input.CurrentStatus === 5) {
            input.CurrentStatus = 1;
        }

        this.CurrentStatus = input.CurrentStatus;
        this.StatusHistory = input.StatusHistory;

        if (!this.Points) {
            this.Points = [];
        }
        //Create lookup
        let pointLookup: Map<string, number> = new Map<string, number>();
        for (let lookupPoint in this.Points) {
            pointLookup.set(this.Points[lookupPoint].PointId, parseInt(lookupPoint));
        }

        for (let point of input.Points) {
            if (pointLookup.has(point.PointId)) {
                this.Points[pointLookup.get(point.PointId)].deserialize(point);
            } else {
                this.Points.push(new PointInstance(point));
            }
        }

        this.AlarmIds = input.AlarmIds;

        this.notficationIsPaused = false;

        return this;
    }
}

