var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Pipe } from '@angular/core';
var AlarmSearchPipe = /** @class */ (function () {
    function AlarmSearchPipe() {
    }
    AlarmSearchPipe.prototype.transform = function (alarms, searchterm) {
        if (!alarms)
            return alarms;
        return alarms.filter(function (alarm) { return alarm.Description.toUpperCase().includes(searchterm.toUpperCase()); });
    };
    AlarmSearchPipe = __decorate([
        Pipe({
            name: 'alarmsearch'
        })
    ], AlarmSearchPipe);
    return AlarmSearchPipe;
}());
export { AlarmSearchPipe };
//# sourceMappingURL=alarm-search.pipe.js.map