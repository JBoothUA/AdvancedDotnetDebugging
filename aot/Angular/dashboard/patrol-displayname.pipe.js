var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Pipe } from '@angular/core';
var PatrolDisplayNamePipe = /** @class */ (function () {
    function PatrolDisplayNamePipe() {
    }
    PatrolDisplayNamePipe.prototype.transform = function (patrolInstances, displayname) {
        if (!patrolInstances)
            return patrolInstances;
        if (patrolInstances.length === 0)
            return patrolInstances;
        if (!displayname)
            return patrolInstances;
        return patrolInstances.filter(function (patrol) { return patrol.DisplayName.trim() === displayname.trim(); });
    };
    PatrolDisplayNamePipe = __decorate([
        Pipe({
            name: 'patroldisplayname'
        })
    ], PatrolDisplayNamePipe);
    return PatrolDisplayNamePipe;
}());
export { PatrolDisplayNamePipe };
//# sourceMappingURL=patrol-displayname.pipe.js.map