import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { DataService } from 'src/app/services/data.service';


@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.css']
})
export class CreateGroupComponent implements OnInit {

  groupname: string = '';
  @Input() parentId: string = '';
  @Input() parentType: string = '';
  @Output() refreshTimeline = new EventEmitter<void>();

  constructor(private api: DataService) { }

  ngOnInit(): void {

  }

  onSubmitCreateGroup() {
    const groupObject = {
      groupname: this.groupname,
      parentid: parseInt(this.parentId),
      parenttype: this.parentType
    }
    this.api.createGroup(groupObject).subscribe({
      next: (res) => {
        alert("Group Created")
        this.groupname = '';
        this.refreshTimeline.emit();
      },
      error: (err) => {
        console.log(err);
        alert("Error, try again later")
      }
    })
  }
}
