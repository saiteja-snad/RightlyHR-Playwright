import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'skills'

})
export class SkillEmployeePipe implements PipeTransform {

  transform(employees: any[], searchValue: string): any[] {
    if (!employees || !searchValue) {
      return employees;
    }

    const lowerSearch = searchValue.toLowerCase().trim().replace(/\s+/g, ' ');

    return employees.filter(emp => {
      const employee = emp.employee || {};

      const name = (employee.name || '').toLowerCase().trim();
      const designation = (employee.employeeDesignation || '').toLowerCase().trim();
      const empId = (employee.employeeId || emp.employeeId || '').toString().toLowerCase().trim();
      const status = (emp.employeeProjectStatus || '').toLowerCase().trim();

      // Flatten and search inside skills (if any)
      const skillMatches = emp.skills?.some((skill: any) =>
        (skill.skillName || '').toLowerCase().includes(lowerSearch) ||
        (skill.proficiencyLevel || '').toLowerCase().includes(lowerSearch) ||
        (skill.skillCategory || '').toLowerCase().includes(lowerSearch)
      );

      // Flatten and search inside projects (if any)
      const projectMatches = emp.projects?.some((proj: any) =>
        (proj.projectName || '').toLowerCase().includes(lowerSearch) ||
        (proj.projectDesignation || '').toLowerCase().includes(lowerSearch)
      );

      return (
        name.includes(lowerSearch) ||
        designation.includes(lowerSearch) ||
        empId.includes(lowerSearch) ||
        status.includes(lowerSearch) ||
        skillMatches ||
        projectMatches
      );
    });
  }
}