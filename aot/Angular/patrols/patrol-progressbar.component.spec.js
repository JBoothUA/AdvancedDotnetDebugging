import { async, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { PatrolProgressbar } from './patrol-progressbar.component';
import { PatrolModule } from './_patrol.module';
import { SharedModule } from '../shared/_shared.module';
import { PatrolService } from './patrol.service';
import { MockPatrolService } from '../test/patrols/mockPatrol.service';
import { HttpModule } from '@angular/http';
import { HttpService } from '../shared/http.service';
import { MockHttpService } from '../test/mockHttp.service';
import { UserService } from '../shared/user.service';
import { MockUserService } from '../test/mockUser.service';
import { LocationFilterService } from '../shared/location-filter.service';
import { LocationFilterPipe } from '../shared/location-filter.pipe';
import { AlarmService } from '../alarms/alarm.service';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import { PlatformService } from './../platforms/platform.service';
import { WindowService } from './../shared/window.service';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
describe('Patrol progressbar component', function () {
    var fixture;
    beforeEach(async(function () {
        TestBed.configureTestingModule({
            imports: [FormsModule, PatrolModule, SharedModule, HttpModule],
            declarations: [PatrolProgressbar],
            providers: [{ provide: PatrolService, useClass: MockPatrolService },
                { provide: HttpService, useClass: MockHttpService },
                { provide: UserService, useClass: MockUserService },
                LocationFilterService, LocationFilterPipe, AlarmService,
                PlatformService, WindowService, PlatformMapService]
        });
        TestBed.compileComponents();
    }));
    //it('should display correct icon', () => {
    //    // Arrange
    //    let patrolService: PatrolService = TestBed.get(PatrolService);
    //    fixture = TestBed.createComponent(PatrolProgressbar);
    //    fixture.componentInstance.patrol = patrolService.patrolTemplates[0];
    //    // Act Assert
    //    patrolService.patrolTemplates[0].AreaType = AreaType.Large;
    //    fixture.detectChanges();
    //    expect(fixture.componentInstance.getPatrolIconSrc()).toBe('/Content/Images/Patrols/large-area-patrol.png');
    //    patrolService.patrolTemplates[0].AreaType = AreaType.Small;
    //    fixture.detectChanges();
    //    expect(fixture.componentInstance.getPatrolIconSrc()).toBe('/Content/Images/Patrols/small-area-patrol.png');
    //    patrolService.patrolTemplates[0].AreaType = AreaType.Perimeter;
    //    fixture.detectChanges();
    //    expect(fixture.componentInstance.getPatrolIconSrc()).toBe('/Content/Images/Patrols/perimeter-patrol.png');
    //});
});
//# sourceMappingURL=patrol-progressbar.component.spec.js.map