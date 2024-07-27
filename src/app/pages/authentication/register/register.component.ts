import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSelectChange } from '@angular/material/select';
import { DataService } from 'src/app/services/data.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class AppSideRegisterComponent {
  password!: string;
  email!: string;
  role!: string;

  constructor(
    private router: Router,
    private api: DataService,
  ) {}

  form = new FormGroup({
    uname: new FormControl('', [Validators.required, Validators.minLength(6)]),
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  onClickRegister() {
    this.api.register(this.email, this.password, this.role).subscribe({
      next: (res: any) => {
        this.router.navigate(['/auth/login'])
      },
      error: (err: any) => {
        alert(err);
      }
    })
  }

  onSelectedGroupChange(event: MatSelectChange) {
    this.role = event.value;
  }
}
