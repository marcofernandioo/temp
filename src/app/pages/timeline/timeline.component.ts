import { Component, OnInit, ChangeDetectorRef, OnChanges, SimpleChanges  } from '@angular/core';
import { Timeline, DataSet } from 'vis-timeline/standalone';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { DataService } from 'src/app/services/data.service';
import { MatSelectChange } from '@angular/material/select';
import { IGroup } from 'src/app/interfaces/group.interface';
import { IIntake } from 'src/app/interfaces/intake.interface';

import { ISemester } from 'src/app/interfaces/semester.interface';


interface ITimeline {
  id: number;
  content: string;
  nestedGroups?: number[];
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
})
export class TimelineComponent implements OnInit {
  parentList: any[] = [];

  selectedParentId: string = '';
  selectedParentType: string = '';
  selectedParentCode: string = '';
  semesterNumbers: Number = 2;
  showTimeline = true;

  timelineDataset: DataSet<ITimeline> = new DataSet();

  semesters: DataSet<any> = new DataSet<any>();

  constructor(
    private api: DataService, 
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.loadParents();
  }

  loadParents() {
    this.api.getParents().subscribe({
      next: (response) => {
        this.parentList = response.items;
      },
      error: (error) => {
        console.error('Error loading parents:', error);
      }
    })
  }

  getParentName(parent: any): string {
    return parent.coursename || parent.programmename || '';
  }

  onSelectedParentChange(event: MatSelectChange) {
    // if (event.value.id === '' && event.value.type === '')
    this.selectedParentId = event.value.id;
    this.selectedParentCode = event.value.code;
    if (event.value.coursename)  {
      this.semesterNumbers = 2;
      this.selectedParentType = "course";
    }

    else if (event.value.programmename) {
      this.selectedParentType = "programme";
      this.semesterNumbers = event.value.semesters;
    } 
    
    else if (event.value.type == '') {
      this.selectedParentType = event.value.type
    }

    this.loadTimelineDataset();
    this.cdr.detectChanges();
  }

  toggleView() {
    this.showTimeline = !this.showTimeline;
  }

  async getGroups(): Promise<IGroup[]> {
    return new Promise((resolve, reject) => {
      this.api.getGroups(this.selectedParentId, this.selectedParentType).subscribe({
        next: (res) => {
          resolve(res);
        },
        error: (err) => {
          console.log(err);
          reject(err);
        }
      });
    });
  }

  async getIntakes(list: any): Promise<IIntake[]> {
    return new Promise((resolve, reject) => {
      this.api.getIntakesByGroupIdList(list).subscribe({
        next: (res) => resolve(res),
        error: (err) => reject(err)
      })
    })
  }

  // From the queried groups id, get all the semesters.
  async getSemesters(list: any):Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.api.getSemestersByIntakeIdList(list).subscribe({
        next: (res) => resolve (res),
        error: (err) => reject(err)
      })
    })
  }

  
  // Formatting
  combineDataIntoTimeline(groups: IGroup[], intakes: IIntake[]): ITimeline[] {
    const timeline: ITimeline[] = [];
    let idCounter = 1;
    const intakeIdMap = new Map<number, number>();
  
    // First, assign new IDs to intakes and create a mapping
    intakes.forEach(intake => {
      intakeIdMap.set(intake.id, idCounter++);
    });
  
    // Process groups
    groups.forEach(group => {
      const nestedGroups = intakes
        .filter(intake => intake.groupid === group.id)
        .map(intake => intakeIdMap.get(intake.id)!);
  
      timeline.push({
        id: idCounter++,
        content: group.groupname,
        nestedGroups: nestedGroups.length > 0 ? nestedGroups : undefined
      });
    });
  
    // Add intakes to the timeline
    intakes.forEach(intake => {
      timeline.push({
        id: intakeIdMap.get(intake.id)!,
        content: intake.code
      });
    });
  
    console.log(JSON.stringify(timeline, null, 4));
    return timeline;
  }

  // Formatting
  transformData(semesters: ISemester[]): any[] {
    return semesters.map((semester, index) => ({
      
      data: {
        id: index + 1,
        group: '', 
        content: semester.name,
        start: new Date(semester.startdate),
        end: new Date(semester.enddate)
      },
      intakeId: semester.intakeid,
    
    }));
  }

  assignIntakeId(data: any[], intakeList: any[], tl: any[]) {
    // Create a mapping of original intake IDs to new timeline IDs
    const intakeIdMap = new Map(tl
      .filter(item => intakeList.some(intake => intake.code === item.content))
      .map(item => [intakeList.find(intake => intake.code === item.content)?.id, item.id]));
  
    return data.map((object) => {
      const newIntakeId = intakeIdMap.get(object.intakeId);
      return {
        ...object.data,
        group: newIntakeId
      }
    });

  }

  async loadTimelineDataset() {
    this.timelineDataset = new DataSet();
    // 1. Store all the Groups into a single list.
    const temporaryGroups = await this.getGroups();
    
    // 2. Get only the Id of the list.
    const groupIdList = temporaryGroups.map(obj => obj.id); // Change this using JSHOF
    
    // 3. From the Group id List, get all the intakes.
    const temporaryIntakes: IIntake[] = await this.getIntakes(groupIdList);
    const intakeIdList = temporaryIntakes.map(o => o.id);
    
    // 4. Combine and transform the two.
    const timelineData = this.combineDataIntoTimeline(temporaryGroups, temporaryIntakes);

    // 5. Combine groupsDataset with semestersDataset into timelineDataset. End.
    this.timelineDataset = new DataSet(timelineData);
    const allSemesters: any[]  = await this.getSemesters(intakeIdList);

    const transformedData = this.transformData(allSemesters);

    const finalSemesterData = this.assignIntakeId(transformedData, temporaryIntakes, timelineData);
    this.semesters = new DataSet(finalSemesterData);

  }

}
