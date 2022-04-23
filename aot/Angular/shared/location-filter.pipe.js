var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Pipe, Injectable } from '@angular/core';
var LocationFilterPipe = /** @class */ (function () {
    function LocationFilterPipe() {
    }
    LocationFilterPipe.prototype.transform = function (value, locationIDs) {
        if (!value)
            return value;
        return value.filter(function (v) {
            return locationIDs.indexOf(v.LocationId) > -1;
        });
    };
    LocationFilterPipe = __decorate([
        Injectable(),
        Pipe({
            name: 'locationFilter'
        })
    ], LocationFilterPipe);
    return LocationFilterPipe;
}());
export { LocationFilterPipe };
//# sourceMappingURL=location-filter.pipe.js.map