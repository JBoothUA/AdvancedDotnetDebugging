var AlarmMarkerSort = /** @class */ (function () {
    function AlarmMarkerSort() {
    }
    AlarmMarkerSort.prototype.sortAlarmMarkers = function (groupedMarkers) {
        for (var group in groupedMarkers) {
            groupedMarkers[group].alarms.sort(function (a, b) {
                var res = 0;
                if (a.Priority > b.Priority) {
                    res = 1;
                }
                else if (a.Priority < b.Priority) {
                    res = -1;
                }
                else {
                    if (a.ReportedTime !== null && b.ReportedTime !== null) {
                        if (a.ReportedTime < b.ReportedTime) {
                            res = 1;
                        }
                        else if (a.ReportedTime > b.ReportedTime) {
                            res = -1;
                        }
                    }
                    else if (a.ReportedTime === null) {
                        res = 1;
                    }
                    else if (b.ReportedTime === null) {
                        res = -1;
                    }
                }
                return res;
            });
        }
    };
    return AlarmMarkerSort;
}());
export { AlarmMarkerSort };
//# sourceMappingURL=alarm-marker-sort.js.map