var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Pipe } from '@angular/core';
var OrderPipe = /** @class */ (function () {
    function OrderPipe() {
    }
    OrderPipe.prototype.transform = function (value, order) {
        if (order === 'desc')
            return value.slice().reverse();
        else
            return value.slice();
    };
    OrderPipe = __decorate([
        Pipe({
            name: 'order'
        })
    ], OrderPipe);
    return OrderPipe;
}());
export { OrderPipe };
//# sourceMappingURL=reverse.pipe.js.map