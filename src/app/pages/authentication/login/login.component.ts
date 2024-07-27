import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';

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
    private router: Router
  ) { }
  
  ngOnInit(): void {
    
  }

  onSubmit(): void {
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
          // Alert the user about the failed login
          alert('Login failed. Please check your credentials and try again.');
        }
      })
  }
}
