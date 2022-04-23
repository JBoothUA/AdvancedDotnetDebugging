import { Location } from './location.class';
import { TenantMapSettings } from './map-settings.class';
var Tenant = /** @class */ (function () {
    function Tenant(tenant) {
        this.clone(tenant);
    }
    Tenant.prototype.clone = function (input) {
        this.Id = input.Id;
        this.TenantId = input.TenantId;
        this.CustomerName = input.CustomerName;
        this.ParentId = input.ParentId;
        this.ETag = input.ETag;
        this.RowKey = input.RowKey;
        this.PartitionKey = input.PartitionKey;
        this.Timestamp = input.Timestamp;
        this.ChildrenIds = [];
        if (input.ChildrenIds && input.ChildrenIds.length > 0) {
            for (var _i = 0, _a = input.ChildrenIds; _i < _a.length; _i++) {
                var id = _a[_i];
                this.ChildrenIds.push(id);
            }
        }
        this.Locations = [];
        if (input.Locations) {
            if (input.Locations.length > 0) {
                for (var _b = 0, _c = input.Locations; _b < _c.length; _b++) {
                    var location_1 = _c[_b];
                    var l = new Location(location_1);
                    this.Locations.push(l);
                }
            }
        }
        if (input.Selected)
            this.Selected = input.Selected;
        else
            this.Selected = false;
        if (input.MapSettings) {
            this.MapSettings = new TenantMapSettings(input.MapSettings);
        }
        return this;
    };
    return Tenant;
}());
export { Tenant };
//# sourceMappingURL=tenant.class.js.map