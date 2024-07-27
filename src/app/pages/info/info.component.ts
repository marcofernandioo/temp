import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrl: './info.component.css'
})
export class InfoComponent implements OnInit, CanDeactivate<InfoComponent> {

  parentList: any[] | null = null;
  originalParentList: string = '';
  hasChanges: boolean = false;
  changedItems: any[] = [];

  constructor(
    private api: DataService
  ) {

  }

  ngOnInit(): void {

      this.loadParentList();
  }

  loadParentList() {
    this.api.getParents().subscribe({
      next: res => {
        this.parentList = res.items;
        if (this.parentList) {
          // Assign default semesters value and store original state
          this.parentList.forEach(item => {
            if (item.semesters === undefined) {
              item.semesters = 2;
            }
          });
          this.originalParentList = JSON.stringify(this.parentList);
        }
      },
      error: err => {
        console.log(err);
      }
    })
  }

  checkForChanges() {
    if (this.parentList) {
      this.changedItems = []; // Reset changed items
      const currentState = JSON.stringify(this.parentList);
      this.hasChanges = currentState !== this.originalParentList;

      if (this.hasChanges) {
        // Identify changed items
        const originalItems = JSON.parse(this.originalParentList);
        this.parentList.forEach((currentItem, index) => {
          if (JSON.stringify(currentItem) !== JSON.stringify(originalItems[index])) {
            this.changedItems.push(currentItem);
          }
        });
      }
    }
  }

  saveChanges() {
    this.changedItems.map((item) => {
      if (item.coursename) {
        const formattedItem = {
          coursename: item.coursename,
          assignableIntake: item.assignableIntake,
          code: item.code
        }
        this.api.editCourse(item.id, formattedItem).subscribe({
          next: (res) => console.log(res),
          error: (err) => console.log(err)
        })
      } else if (item.programmename) {
        const formattedItem = {
          programmename: item.programmename,
          code: item.code,
          semesters: item.semesters,
          course_id: item.course_id,
          assignableIntake: item.assignableIntake
        }
        this.api.editProgramme(item.id, formattedItem).subscribe({
          next: (res) => console.log(res),
          error: (err) => console.log(err)
        })
      }
    })
    
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.hasChanges) {
      return new Observable<boolean>(observer => {
        const result = window.confirm('You have unsaved changes. Do you really want to leave?');
        observer.next(result);
        observer.complete();
      });
    }
    return true;
  }

}
