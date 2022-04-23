var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
var DropDown = /** @class */ (function () {
    function DropDown() {
        this.select = new EventEmitter();
        this.listValues = [];
        this.displayLabel = '';
    }
    DropDown.prototype.ngOnInit = function () {
        //this.select.emit(this.listValues[0]);
        //this.listValues = this.listData;
    };
    DropDown.prototype.ngAfterViewInit = function () {
        if (this.selectDefault)
            this.select.emit(this.dropDown.nativeElement.value);
    };
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], DropDown.prototype, "select", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], DropDown.prototype, "listValues", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], DropDown.prototype, "displayLabel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], DropDown.prototype, "selectWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], DropDown.prototype, "selectDefault", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], DropDown.prototype, "selectID", void 0);
    __decorate([
        ViewChild('dropdownSelect'),
        __metadata("design:type", ElementRef)
    ], DropDown.prototype, "dropDown", void 0);
    DropDown = __decorate([
        Component({
            selector: 'dropdown',
            template: "<div>\n                <label id=\"dropdownLabel\" for=\"dropdownSelect\">{{displayLabel}}\n                <select #dropdownSelect class=\"dropdownSelect\" id=\"dropdownSelect-{{selectID}}\" [style.width.px]=\"selectWidth\" (change)=\"select.emit(dropdownSelect.value)\">\n                    <option *ngFor=\"let listValue of listValues | keys\" label=\"{{listValue.key}}\" [selected]=\"listValue.value == selectDefault\">\n                        {{listValue.value}}\n                    </option>\n                </select>\n                </label>\n              </div>",
            styles: ["\n            #dropdownLabel {\n                /*float: left;\n                position: relative;*/\n                display: inline-block;\n                font-size: 16px;\n            }\n\n            .dropdownSelect {\n                /*float: left;\n                margin-left: 7px;\n                margin-top: 4px;*/\n                padding-left: 10px;\n                padding-right: 10px;\n                font-family: \"Segoe UI\", Frutiger, \"Frutiger Linotype\", \"Dejavu Sans\", \"Helvetica Neue\", Arial, sans-serif !important;\n                color: #6b6b6b;\n                font-size: 16px;\n                display: block;\n            }\n    "]
        }),
        __metadata("design:paramtypes", [])
    ], DropDown);
    return DropDown;
}());
export { DropDown };
//# sourceMappingURL=dropdown.component.js.map