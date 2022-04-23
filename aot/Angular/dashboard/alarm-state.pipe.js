var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Pipe } from '@angular/core';
var AlarmStatePipe = /** @class */ (function () {
    function AlarmStatePipe() {
    }
    AlarmStatePipe.prototype.transform = function (alarms, selectedState) {
        if (!alarms)
            return alarms;
        if (selectedState <= 0)
            return alarms;
        return alarms.filter(function (alarm) { return alarm.State === selectedState; });
    };
    AlarmStatePipe = __decorate([
        Pipe({
            name: 'alarmstate'
        })
    ], AlarmStatePipe);
    return AlarmStatePipe;
}());
export { AlarmStatePipe };
//# sourceMappingURL=alarm-state.pipe.js.map