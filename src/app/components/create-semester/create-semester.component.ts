import { Component, OnInit, Input, OnChanges, SimpleChanges, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { DataService } from 'src/app/services/data.service';
import { MatSelectChange } from '@angular/material/select';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

interface DateRange {
  name: string;
  label: string;
  isSemester?: boolean;
}

@Component({
  selector: 'app-create-semester',
  templateUrl: './create-semester.component.html',
  styleUrls: ['./create-semester.component.css']
})
export class CreateSemesterComponent implements OnInit, OnChanges {
  @Input() parentId: string | null = '';
  @Input() parentType: string | null = '';
  @Input() numberOfSemesters: any = 2;
  @Output() refreshData = new EventEmitter<void>();

  dateRangeForm!: FormGroup;
  selectedIntakeID!: Number;
  semesters: number[] = [];
  groupIdList: number[] | null = null;

  availableIntakes: any[] | null = null;
  selectedIntake: any | null = null;

  private updatingDates = false;

  defaultDurations = {
    semester: 14,
    midSemesterBreak: 1,
    bufferWeek: 1,
    exams: 2
  };

  dateRanges: DateRange[] = [
    { name: 'semester', label: 'Semester', isSemester: true },
    { name: 'midSemesterBreak', label: 'Mid-Semester Break' },
    { name: 'bufferWeek', label: 'Buffer Week' },
    { name: 'exams', label: 'Exams' },
  ];

  constructor(
    private api: DataService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) { }

  onlyMondays(date: any | null) {
    if (!date) 
      date = new Date();
    var day = date.getDay();
    return day === 1;
  }

  loadGroupIdList() {
    this.api.getGroups(this.parentId, this.parentType).subscribe({
      next: (response) => {
        this.groupIdList = response.map(item => item.id)
        this.loadIntakesList(this.groupIdList);
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        alert("Error loading groups. Please try again.");
      }
    });
  }

  loadIntakesList(list: any) {
    this.api.getIntakesByGroupIdList(list).subscribe({
      next: (response) => {
        this.availableIntakes = response;
      },
      error: (error) => {
        console.error('Error intakes:', error);
        alert("Error loading Intakes. Please try again.");
      }
    })
  }

  onSelectedIntakeChange(event: MatSelectChange) {

    this.selectedIntakeID = event.value;
    const selectedIntake = this.findSelectedIntake(this.selectedIntakeID);
    if (selectedIntake) {
      this.updateFirstSemesterStartDate(new Date(selectedIntake.startdate));
    }
  }

  findSelectedIntake(intakeId: Number): any {
    return this.availableIntakes?.find(intake => intake.id === intakeId);
  }

  updateFirstSemesterStartDate(startDate: Date) {
    const semesterGroup = this.dateRangeForm.get('semesters.semester1');
    if (semesterGroup) {
      // Set semester start date
      semesterGroup.get('semester.startDate')?.setValue(startDate);

      // Calculate and set mid-semester break start date (7th week)
      const midSemesterBreakStart = new Date(startDate);
      midSemesterBreakStart.setDate(midSemesterBreakStart.getDate() + 6 * 7); // 6 weeks after start
      semesterGroup.get('midSemesterBreak.startDate')?.setValue(midSemesterBreakStart);

      // Calculate and set buffer week start date (15th week)
      const bufferWeekStart = new Date(startDate);
      bufferWeekStart.setDate(bufferWeekStart.getDate() + 14 * 7); // 14 weeks after start
      semesterGroup.get('bufferWeek.startDate')?.setValue(bufferWeekStart);

      // Calculate and set exam week start date (right after buffer week)
      const examWeekStart = new Date(bufferWeekStart);
      examWeekStart.setDate(examWeekStart.getDate() + 7); // 1 week after buffer week starts
      semesterGroup.get('exams.startDate')?.setValue(examWeekStart);

      // Trigger updates for each date change
      this.onDateChange(startDate, 1, 'semester', 'startDate');
      this.onDateChange(midSemesterBreakStart, 1, 'midSemesterBreak', 'startDate');
      this.onDateChange(bufferWeekStart, 1, 'bufferWeek', 'startDate');
      this.onDateChange(examWeekStart, 1, 'exams', 'startDate');
      // Set semester start date and duration
      // semesterGroup.get('semester.startDate')?.setValue(startDate, { emitEvent: false });
      // semesterGroup.get('semester.duration')?.setValue(this.defaultDurations.semester, { emitEvent: false });

      // // Calculate and set mid-semester break
      // const midSemesterBreakStart = new Date(startDate);
      // midSemesterBreakStart.setDate(midSemesterBreakStart.getDate() + this.defaultDurations.semester * 7 / 2);
      // semesterGroup.get('midSemesterBreak.startDate')?.setValue(midSemesterBreakStart, { emitEvent: false });
      // semesterGroup.get('midSemesterBreak.duration')?.setValue(this.defaultDurations.midSemesterBreak, { emitEvent: false });

      // // Calculate and set buffer week
      // const bufferWeekStart = new Date(startDate);
      // bufferWeekStart.setDate(bufferWeekStart.getDate() + this.defaultDurations.semester * 7);
      // semesterGroup.get('bufferWeek.startDate')?.setValue(bufferWeekStart, { emitEvent: false });
      // semesterGroup.get('bufferWeek.duration')?.setValue(this.defaultDurations.bufferWeek, { emitEvent: false });

      // // Calculate and set exam week
      // const examWeekStart = new Date(bufferWeekStart);
      // examWeekStart.setDate(examWeekStart.getDate() + this.defaultDurations.bufferWeek * 7);
      // semesterGroup.get('exams.startDate')?.setValue(examWeekStart, { emitEvent: false });
      // semesterGroup.get('exams.duration')?.setValue(this.defaultDurations.exams, { emitEvent: false });

      // // Update end dates
      // this.updateEndDate(semesterNum, 'semester');
      // this.updateEndDate(semesterNum, 'midSemesterBreak');
      // this.updateEndDate(semesterNum, 'bufferWeek');
      // this.updateEndDate(semesterNum, 'exams');
    }
  }

  updateSemesters() {
    this.semesters = Array(this.numberOfSemesters).fill(0).map((_, i) => i + 1);
  }

  ngOnInit() {
    this.semesters = Array(this.numberOfSemesters).fill(0).map((_, i) => i + 1);
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentId'] || changes['parentType'] || changes['numberOfSemesters']) {
      this.loadGroupIdList();

      if (changes['numberOfSemesters']) {
        this.updateSemesters();
        this.initForm();
      }

      this.cdr.detectChanges();
    }
  }

  initForm() {
    const semestersGroup = this.fb.group({});

    this.semesters.forEach(semesterNum => {
      const semesterGroup = this.fb.group({});
  
      this.dateRanges.forEach(range => {
        const rangeControls: any = {
          startDate: ['', Validators.required],
          endDate: ['', Validators.required],
          duration: ['', [Validators.required, Validators.min(range.name === 'semester' ? 1 : 0)]]
        };
  
        if (range.isSemester) {
          rangeControls['durationOption'] = [''];
        }
  
        semesterGroup.addControl(range.name, this.fb.group(rangeControls));
      });
  
      semestersGroup.addControl(`semester${semesterNum}`, semesterGroup);
    });

    this.dateRangeForm = this.fb.group({
      semesters: semestersGroup
    });

    this.semesters.forEach(semesterNum => {
      this.dateRanges.forEach(range => {
        this.setupDateListeners(semesterNum, range.name);
      });
    });
  }

  setupDateListeners(semesterNum: number, rangeName: string) {
    const rangeGroup = this.dateRangeForm.get(`semesters.semester${semesterNum}.${rangeName}`);

    rangeGroup?.get('startDate')?.valueChanges.subscribe(date =>
      this.onDateChange(date, semesterNum, rangeName, 'startDate')
    );
    rangeGroup?.get('endDate')?.valueChanges.subscribe(date =>
      this.onDateChange(date, semesterNum, rangeName, 'endDate')
    );
    rangeGroup?.get('duration')?.valueChanges.subscribe(() =>
      this.updateEndDate(semesterNum, rangeName)
    );
    if (this.dateRanges.find(r => r.name === rangeName)?.isSemester) {
      rangeGroup?.get('durationOption')?.valueChanges.subscribe(() =>
        this.onDurationOptionChange(semesterNum, rangeName)
      );
    }
  }

  onDurationOptionChange(semesterNum: number, rangeName: string) {
    const rangeGroup = this.dateRangeForm.get(`semesters.semester${semesterNum}.${rangeName}`);
    const durationOption = rangeGroup?.get('durationOption')?.value;
    
    if (durationOption) {
      rangeGroup?.get('duration')?.setValue(parseInt(durationOption), { emitEvent: false });
      this.updateEndDate(semesterNum, rangeName);
    }
  }

  updateEndDateOrDuration(semesterNum: number, rangeName: string) {
    if (this.updatingDates) return;

    const rangeGroup = this.dateRangeForm.get(`semesters.semester${semesterNum}.${rangeName}`);
    const startDate = rangeGroup?.get('startDate')?.value;
    const endDate = rangeGroup?.get('endDate')?.value;

    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const durationInWeeks = Math.ceil(diffDays / 7);
      rangeGroup?.get('duration')?.setValue(durationInWeeks, { emitEvent: false });
    }
  }

  updateStartDateOrDuration(semesterNum: number, rangeName: string) {
    if (this.updatingDates) return;

    const rangeGroup = this.dateRangeForm.get(`semesters.semester${semesterNum}.${rangeName}`);
    const startDate = rangeGroup?.get('startDate')?.value;
    const endDate = rangeGroup?.get('endDate')?.value;

    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const durationInWeeks = Math.ceil(diffDays / 7);
      rangeGroup?.get('duration')?.setValue(durationInWeeks, { emitEvent: false });
    }
  }

  updateEndDate(semesterNum: number, rangeName: string) {
    const rangeGroup = this.dateRangeForm.get(`semesters.semester${semesterNum}.${rangeName}`);
    const startDate = rangeGroup?.get('startDate')?.value;
    const duration = rangeGroup?.get('duration')?.value;

    if (startDate && duration) {
      const newEndDate = new Date(startDate);
      newEndDate.setDate(newEndDate.getDate() + duration * 7 - 1);
      rangeGroup?.get('endDate')?.setValue(newEndDate, { emitEvent: false });
    }
  }

  dateRangeValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const form = control as FormGroup;
    const errors: { [key: string]: boolean } = {};

    for (let i = 1; i <= this.numberOfSemesters; i++) {
      const semesterGroup = form.get(`semesters.semester${i}`);
      const semesterStart = semesterGroup?.get('semester.startDate')?.value;
      const semesterEnd = semesterGroup?.get('semester.endDate')?.value;

      if (semesterStart && semesterEnd) {
        ['midSemesterBreak', 'bufferWeek', 'exams'].forEach(period => {
          const periodStart = semesterGroup?.get(`${period}.startDate`)?.value;
          const periodEnd = semesterGroup?.get(`${period}.endDate`)?.value;

          if (periodStart && periodEnd) {
            if (periodStart < semesterStart || periodEnd > semesterEnd) {
              errors[`semester${i}_${period}OutOfRange`] = true;
            }
          }
        });
      }
    }

    return Object.keys(errors).length ? errors : null;
  }

  onDateChange(event: MatDatepickerInputEvent<Date> | Date, semesterNum: number, rangeName: string, dateType: 'startDate' | 'endDate') {
    // const date = event instanceof Date ? event : event.value;
    // if (date) {
    //   const rangeGroup = this.dateRangeForm.get(`semesters.semester${semesterNum}.${rangeName}`);
    //   rangeGroup?.get(dateType)?.setValue(date);
    //   if (dateType === 'startDate') {
    //     this.updateEndDateOrDuration(semesterNum, rangeName);
    //   } else {
    //     this.updateStartDateOrDuration(semesterNum, rangeName);
    //   }
    // }
    if (this.updatingDates) return;

    const date = event instanceof Date ? event : event.value;
    if (date) {
      this.updatingDates = true;
      try {
        const rangeGroup = this.dateRangeForm.get(`semesters.semester${semesterNum}.${rangeName}`);
        rangeGroup?.get(dateType)?.setValue(date, { emitEvent: false });
        if (dateType === 'startDate') {
          this.updateEndDateOrDuration(semesterNum, rangeName);
        } else {
          this.updateStartDateOrDuration(semesterNum, rangeName);
        }
      } finally {
        this.updatingDates = false;
      }
    }
  }

  formatData(input: any): any {
    const output: any = [];

    Object.entries(input.semesters).forEach(([semesterKey, semesterValue]: [string, any], index) => {
      const newSemester: any = {
        name: `Semester ${index + 1}`,
        startdate: semesterValue.semester.startDate,
        enddate: semesterValue.semester.endDate,
        duration: semesterValue.semester.duration,
        midsemstart: semesterValue.midSemesterBreak.startDate,
        midsemend: semesterValue.midSemesterBreak.endDate,
        midsemduration: semesterValue.midSemesterBreak.duration,
        bufferstart: semesterValue.bufferWeek.startDate,
        bufferend: semesterValue.bufferWeek.endDate,
        buffersemduration: semesterValue.bufferWeek.duration,
        examstart: semesterValue.exams.startDate,
        examend: semesterValue.exams.endDate,
        examduration: semesterValue.exams.duration,
        intakeid: this.selectedIntakeID
      };
      output.push(newSemester);
    });
    return output;
  }

  formatDates(data: any): any {
    if (data instanceof Date) {
      return this.formatDate(data);
    } else if (Array.isArray(data)) {
      return data.map(item => this.formatDates(item));
    } else if (typeof data === 'object' && data !== null) {
      const formatted: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          formatted[key] = this.formatDates(data[key]);
        }
      }
      return formatted;
    }
    return data;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  submitForm() {
    if (this.dateRangeForm.valid) {
      console.log(this.dateRangeForm);
      const formData = this.dateRangeForm.value;

      const formattedData = this.formatDates(formData);
      const finalData = this.formatData(formattedData);
      this.api.createBulkSemesters(finalData, this.selectedIntakeID).subscribe({
        next: (res) => {
          alert('Semester created successfully!')
          this.refreshData.emit();
        },
        error: (err) => {
          console.error(err);
          alert('Error creating semester. Try again.')
        }
      })
      this.resetForm();
    } else {
      alert('Form is invalid. Please check all fields.');
    }
  }

  resetForm() {
    this.dateRangeForm.reset();

    // Re-initialize the form with empty values
    const semestersControl = this.dateRangeForm.get('semesters') as FormGroup;

    this.semesters.forEach(semesterNum => {
      const semesterGroup = semestersControl.get('semester' + semesterNum) as FormGroup;

      this.dateRanges.forEach(range => {
        const rangeGroup = semesterGroup.get(range.name) as FormGroup;
        rangeGroup.patchValue({
          startDate: null,
          endDate: null,
          duration: null
        });
      });
    });
  }

}