var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Pipe } from '@angular/core';
var AlarmPriorityPipe = /** @class */ (function () {
    function AlarmPriorityPipe() {
    }
    AlarmPriorityPipe.prototype.transform = function (alarms, selectedPriority) {
        if (!alarms)
            return alarms;
        if (selectedPriority <= 0)
            return alarms;
        return alarms.filter(function (alarm) { return alarm.Priority === selectedPriority; });
    };
    AlarmPriorityPipe = __decorate([
        Pipe({
            name: 'alarmpriority'
        })
    ], AlarmPriorityPipe);
    return AlarmPriorityPipe;
}());
export { AlarmPriorityPipe };
//# sourceMappingURL=alarm-priority.pipe.js.map