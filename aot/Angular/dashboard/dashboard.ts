import { PatrolInstance } from '../patrols/patrol.class';

export enum FilterTimeframe {
    Current = 0,
    EightHours = 1,
    TwelveHours = 2,
    TwentyFourHours = 3,
    LastWeek = 4,
    Custom = 5,
    None = 6
}

export enum SliderType {
    Locations = 0,
    Platforms,
    None
}

export interface TenantLocation {
    ID: string;
    Name: string;
    LocationID: string;
    LocationName: string;
    LocationCity: string;
    LocationState: string;
    Priority: string;
    PriorityString: string;
    PriorityCount: string;
}

//export enum ResultsSize {
//    Small = 698,
//    Medium = 873,
//    Large = 968,
//    None = 0
//}

export interface AlarmOperator {
    Name: string;
    Initials: any[];
    More: boolean;
    MoreOperators: AlarmOperator[];
}

export enum DashboardTabs {
    Alarms = 0,
    Patrols,
    Robots,
    None
}

export interface PatrolStatusData {
    Successful: number;
    Warning: number;
    Incomplete: number;
    Critical: number;
    Selected: PatrolStatus;
}

export enum PatrolStatus {
    Successful = 0,
    Warning,
    Incomplete,
    Critical,
    Healthy,
    None
}

export interface PatrolStatusObj {
    Status: PatrolStatus;
    Icon: string;
    DisplayText: string;
    DisplayPercentage: Number;
}

export interface PatrolCheckpointStatus {
    FailedDisplayText: string;
    SuccessfulCount: number;
    Icon: string;
}

export interface RobotAndDrone {
    ID: string;
    DisplayName: string;
    Manufacturer: string;
    //PatrolStatus: PatrolStatus;
    LocationName: string;
    PatrolTemplateID: string;
    Patrol: PatrolInstance;
    HistoricalPatrolsCount: number;
    PatrolSubmitted: boolean;
}

export interface PatrolAlarmPriorityCount {
    P1: number;
    P2: number;
    P3: number;
    P4: number;
    Total: number;
}