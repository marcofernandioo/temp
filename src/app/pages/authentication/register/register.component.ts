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

  
  validateInput(): boolean {
    if (this.email == '' || this.password  == '') {
      alert('Input cannot be empty');
      return false;
    }

    if (!this.email.includes('@mail.apu.edu.my')) {
      alert('Email must contain "@mail.apu.edu.my"');
      return false;
    }

    if (this.password.length < 5) {
      alert('Password must be at least 5 characters long');
      return false;
    }

    if (!this.role) {
      alert("User role cannot be empty");
      return false;
    }

    return true;
  }

  onClickRegister() {
    if (!this.validateInput()) return;

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
