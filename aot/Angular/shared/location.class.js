import { LocationMapSettings } from './map-settings.class';
var Location = /** @class */ (function () {
    function Location(location) {
        this.clone(location);
    }
    Location.prototype.clone = function (input) {
        this.Id = input.Id;
        this.Name = input.Name;
        this.City = input.City;
        this.State = input.State;
        if (input.Selected)
            this.Selected = input.Selected;
        else
            this.Selected = false;
        if (input.Priority)
            this.Priority = input.Priority;
        else
            this.Priority = '5';
        if (input.MapSettings) {
            this.MapSettings = new LocationMapSettings(input.MapSettings);
        }
        return this;
    };
    return Location;
}());
export { Location };
//# sourceMappingURL=location.class.js.map