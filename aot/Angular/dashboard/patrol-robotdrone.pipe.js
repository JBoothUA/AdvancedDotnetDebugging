var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Pipe } from '@angular/core';
var PatrolRobotDronePipe = /** @class */ (function () {
    function PatrolRobotDronePipe() {
    }
    PatrolRobotDronePipe.prototype.transform = function (patrolInstances, platformID) {
        if (!patrolInstances)
            return patrolInstances;
        if (!platformID)
            return patrolInstances;
        return patrolInstances.filter(function (patrol) { return patrol.PlatformId === platformID; });
    };
    PatrolRobotDronePipe = __decorate([
        Pipe({
            name: 'patrolrobot'
        })
    ], PatrolRobotDronePipe);
    return PatrolRobotDronePipe;
}());
export { PatrolRobotDronePipe };
//# sourceMappingURL=patrol-robotdrone.pipe.js.map