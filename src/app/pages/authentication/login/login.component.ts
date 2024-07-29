import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class AppSideLoginComponent {
  email: string = '';
  password: string = '';

  constructor(
    private api: HttpClient,
    private authService: DataService,
    private router: Router,
    private toastr: ToastrService,
    private sb: MatSnackBar
  ) { }
  
  ngOnInit(): void {
    
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

   
    return true;
  }

  onSubmit(): void {
    if (!this.validateInput()) return;
    
    this.authService.login(this.email, this.password)
      .subscribe({
        next: (response) => {
          if (response.access_token) {
            const role = this.authService.getUserRole();
            if (role === 'admin') {
              this.router.navigate(['/dashboard/admin']);
            } else if (role === 'scheduler') {
              this.router.navigate(['/dashboard/scheduler'])
            } else {
              this.authService.clearToken();
            }
          }
        },
        error: (error) => {
          console.error('Login failed', error);
          alert('Login failed. Please check your credentials and try again.');
        }
      })
  }
}
