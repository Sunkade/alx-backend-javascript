export default function createReportObject(employeesList) {
  // Initialize an empty object to store all employees by department
  const allEmployees = {};

  // Iterate through the provided employeesList
  for (const [departmentName, employees] of Object.entries(employeesList)) {
    // Copy the array of employees to the corresponding department in allEmployees
    allEmployees[departmentName] = [...employees];
  }

  // Return the report object with allEmployees property and getNumberOfDepartments method
  return {
    allEmployees,
    getNumberOfDepartments() {
      // Calculate and return the number of departments in the employeesList
      return Object.keys(employeesList).length;
    },
  };
}
