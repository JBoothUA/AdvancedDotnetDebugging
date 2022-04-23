var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, Output, ChangeDetectionStrategy, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { CommandName } from './../patrols/action.class';
var Type;
(function (Type) {
    Type[Type["Preset"] = 0] = "Preset";
    Type[Type["Custom"] = 1] = "Custom";
    Type[Type["Message"] = 2] = "Message";
    Type[Type["AudioFile"] = 3] = "AudioFile";
})(Type || (Type = {}));
var SayPlayChooser = /** @class */ (function () {
    function SayPlayChooser(ref) {
        this.ref = ref;
        this.mode = 'normal';
        this.sayParameterList = [];
        this.playParameterList = [];
        this.hideIcon = false;
        this.onCommandChange = new EventEmitter();
        this.onValueChange = new EventEmitter();
        this.onEnterPress = new EventEmitter();
        this.Type = Type;
        this.selectedType = Type.Preset;
        this.CommandName = CommandName;
    }
    Object.defineProperty(SayPlayChooser.prototype, "commandName", {
        set: function (commandName) {
            if (commandName === CommandName.SayMessage) {
                if (this.mode === 'normal') {
                    this.selectedType = Type.Message;
                }
                else {
                    this.selectedType = Type.Preset;
                }
            }
            else {
                this.selectedType = Type.AudioFile;
            }
        },
        enumerable: true,
        configurable: true
    });
    SayPlayChooser.prototype.setCustomValue = function (msg) {
        this.selectedItem = null;
        this.customItem = msg;
        this.ref.markForCheck();
    };
    SayPlayChooser.prototype.setValue = function (command, val) {
        var _this = this;
        this.selectedName = null;
        if (command == CommandName.SayMessage) {
            //Is it in the say parameter list?
            if (this.sayParameterList) {
                this.sayParameterList.Presets.forEach(function (item, index) {
                    if (item.StringValue === val) {
                        _this.selectedType = Type.Preset;
                        _this.selectedItem = val;
                        _this.selectedName = item.Name;
                    }
                });
            }
            //Must be custom say
            if (!this.selectedItem) {
                this.selectedType = Type.Custom;
                this.customItem = val;
            }
        }
        else {
            //Is it in the play parameter list?
            if (this.playParameterList) {
                this.playParameterList.Presets.forEach(function (item, index) {
                    if (item.StringValue === val) {
                        _this.selectedItem = val;
                        _this.selectedName = item.Name;
                    }
                });
            }
        }
        this.ref.detectChanges();
        if (this.selectedName != null) {
            var elem = document.getElementById(this.selectedName + this.groupID);
            if (elem != null) {
                var elemTop = elem.offsetTop;
                var parentElem = document.getElementById('presetsList' + this.groupID);
                if (parentElem != null) {
                    parentElem.scrollTop = elemTop - parentElem.offsetTop + parentElem.scrollTop;
                }
            }
        }
    };
    ;
    SayPlayChooser.prototype.ngOnInit = function () {
        this.groupID = this.createGUID();
    };
    SayPlayChooser.prototype.selectItem = function (name) {
        this.selectedItem = name;
        this.customItem = undefined;
        this.ref.markForCheck();
        this.onValueChange.emit(this.selectedItem.replace(/\r?\n|\r/g, ''));
    };
    SayPlayChooser.prototype.commandChange = function (commandName) {
        this.selectedItem = undefined;
        this.customItem = undefined;
        this.ref.markForCheck();
        this.onCommandChange.emit(commandName);
        this.onValueChange.emit(undefined);
    };
    SayPlayChooser.prototype.commandChangeCompact = function (commandName, commandType) {
        this.selectedItem = undefined;
        this.customItem = undefined;
        this.selectedType = commandType;
        this.ref.markForCheck();
        this.onCommandChange.emit(commandName);
        this.onValueChange.emit(undefined);
    };
    SayPlayChooser.prototype.customValueChange = function (data) {
        this.selectedItem = undefined;
        this.ref.markForCheck();
        this.onValueChange.emit(this.customItem.replace(/\r?\n|\r/g, ''));
    };
    SayPlayChooser.prototype.fireEnterEvent = function () {
        this.onEnterPress.emit(this.customItem.replace(/\r?\n|\r/g, ''));
    };
    SayPlayChooser.prototype.getPresetList = function () {
        if (this.selectedType === Type.AudioFile) {
            if (this.playParameterList) {
                return this.playParameterList.Presets;
            }
            else {
                return [];
            }
        }
        else {
            if (this.sayParameterList) {
                return this.sayParameterList.Presets;
            }
            else {
                return [];
            }
        }
    };
    SayPlayChooser.prototype.createGUID = function () {
        var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var cryptoObj = window.crypto;
            var r = cryptoObj.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return guid;
    };
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], SayPlayChooser.prototype, "mode", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], SayPlayChooser.prototype, "sayParameterList", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], SayPlayChooser.prototype, "playParameterList", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], SayPlayChooser.prototype, "hideIcon", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], SayPlayChooser.prototype, "onCommandChange", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], SayPlayChooser.prototype, "onValueChange", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], SayPlayChooser.prototype, "onEnterPress", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number),
        __metadata("design:paramtypes", [Number])
    ], SayPlayChooser.prototype, "commandName", null);
    SayPlayChooser = __decorate([
        Component({
            selector: 'say-play-chooser',
            templateUrl: 'say-play-chooser.component.html',
            styleUrls: ['say-play-chooser.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [ChangeDetectorRef])
    ], SayPlayChooser);
    return SayPlayChooser;
}());
export { SayPlayChooser };
//# sourceMappingURL=say-play-chooser.component.js.map