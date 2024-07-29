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

  validateInput() {
    if (!this.groupname) {
      alert("Group name cannot be empty");
      return false
    }
    if (this.groupname == '') {
      alert("Group name cannot be empty string")
      return false
    }
    const parts = this.groupname.split(' ');
    if (parts.length !== 2) {
      alert( "Group name must consist of two parts separated by a space");
      return false
    }
    const [word, yearStr] = parts;

    if (word !== word.toUpperCase()) {
      alert( "The first part of the group name must be in all capital letters");
      return false
    }

    if (!/^[A-Z]+$/.test(word)) {
      alert( "The first part of the group name must contain only letters");
      return false
    }
    if (!/^\d{4}$/.test(yearStr)) {
      alert( "The year must be a 4-digit number");
      return false
    }

    const year = parseInt(yearStr, 10);
    const currentYear = new Date().getFullYear();

    if (year < 2000 || year > currentYear + 10) {
      alert(`The year must be between 2000 and ${currentYear + 10}.`);
      return false;
    }
    return true;
  }

  onSubmitCreateGroup() {
    if (!this.validateInput()) return;

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
