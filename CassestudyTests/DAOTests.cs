using Xunit;
using HelpdeskDAL;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Reflection;
using System.Threading.Tasks;
using Xunit.Abstractions;

namespace CassestudyTests
{
    public class DAOTests
    {
        private readonly ITestOutputHelper output;
        public DAOTests(ITestOutputHelper output)
        {
            this.output = output;
        }

        [Fact]
        public async Task Employee_GetByEmailTest()
        {
            EmployeeDAO dao = new();
            Employee selectedEmployee = await dao.GetByEmail("bs@abc.com");
            Assert.NotNull(selectedEmployee);
        }
        [Fact]
        public async Task Employee_GetByIdTest()
        {
            EmployeeDAO dao = new();
            Employee selectedEmployee = await dao.GetById(1);;
            Assert.NotNull(selectedEmployee);
        }
        [Fact]
        public async Task Employee_GetAllTest()
        {
            EmployeeDAO dao = new();
            List<Employee> allEmployees = await dao.GetAll(); ;
            Assert.True(allEmployees.Count > 0);
        }
        [Fact]
        public async Task Employee_AddTest()
        {
            EmployeeDAO dao = new();
            Employee newEmployee = new()
            {
                Title = "Mr",
                FirstName = "Joe",
                LastName = "Smith",
                PhoneNo = "(555) 555-5555",
                Email = "js@abc.com",
                DepartmentId = 500,
            };
            Assert.True(await dao.Add(newEmployee) > 0);
        }
        [Fact]
        public async Task Employee_UpdateTest()
        {
            EmployeeDAO dao = new();
            Employee? employeeForUpdate = await dao.GetByEmail("js@abc.com");
            if (employeeForUpdate != null)
            {
                string oldPhoneNo = employeeForUpdate.PhoneNo!;
                string newPhoneNo = oldPhoneNo == "519-555-1234" ? "555-555-5555" : "519-555-1234";
                employeeForUpdate!.PhoneNo = newPhoneNo;
            }
            Assert.True(await dao.Update(employeeForUpdate!) == UpdateStatus.Ok);
        }
        [Fact]
        public async Task Employee_DeleteTest()
        {
            EmployeeDAO dao = new();
            Employee? employeeForDelete = await dao.GetByEmail("js@abc.com");
            Assert.True(await dao.Delete(employeeForDelete.Id) == 1);
        }
        [Fact]
        public async Task Employee_ConcurrencyTest()
        {
            EmployeeDAO dao1 = new();
            EmployeeDAO dao2 = new();
            Employee EmployeeForUpdate1 = await dao1.GetByEmail("js@abc.com");
            Employee EmployeeForUpdate2 = await dao2.GetByEmail("js@abc.com");
            if (EmployeeForUpdate1 != null)
            {
                string? oldPhoneNo = EmployeeForUpdate1.PhoneNo;
                string? newPhoneNo = oldPhoneNo == "519-555-1234" ? "555-555-5555" : "519-555-1234";
                EmployeeForUpdate1.PhoneNo = newPhoneNo;
                if (await dao1.Update(EmployeeForUpdate1) == UpdateStatus.Ok)
                {
                    // need to change the phone # to something else
                    EmployeeForUpdate2.PhoneNo = "666-666-6668";
                    Assert.True(await dao2.Update(EmployeeForUpdate2) == UpdateStatus.Stale);
                }
                else
                    Assert.True(false); // first update failed
            }
            else
                Assert.True(false); // didn't find Employee 1
        }
        [Fact]
        public async Task Employee_LoadPicsTest()
        {
            {
                CasestudyDALPicUtil util = new();
                Assert.True(await util.AddEmployeePicsToDb());
            }
        }
        [Fact]
        public async Task Call_ComprehensiveTest()
        {
            CallDAO cdao = new();
            EmployeeDAO edao = new();
            ProblemDAO pdao = new();
            Employee hassan = await edao.GetByEmail("ah@abc.com");
            Employee burner = await edao.GetByEmail("bb@abc.com");
            Problem badDrive = await pdao.GetByDescription("Hard Drive Failure");
            Call call = new()
            {
                DateOpened = DateTime.Now,
                DateClosed = null,
                OpenStatus = true,
                EmployeeId = hassan.Id,
                TechId = burner.Id,
                ProblemId = badDrive.Id,
                Notes = "Hassan's drive is shot, Burner to fix it"
            };
            int newCallId = await cdao.Add(call);
            output.WriteLine("New Call Generated - Id = " + newCallId);
            call = await cdao.GetById(newCallId);
            byte[] oldtimer = call.Timer!;
            output.WriteLine("New Call Retrieved");
            call.Notes += "\n Ordered new drive!";
            if (await cdao.Update(call) == UpdateStatus.Ok)
            {
                output.WriteLine("Call was updated " + call.Notes);
            }
            else
            {
                output.WriteLine("Call was not updated!");
            }
            call.Timer = oldtimer;
            call.Notes = "doesn't matter data is stale now";
            if (await cdao.Update(call) == UpdateStatus.Stale)
            {
                output.WriteLine("Call was not updated due to stale data");
            }
            cdao = new CallDAO();
            await cdao.GetById(newCallId);
            if (await cdao.Delete(newCallId) == 1)
            {
                output.WriteLine("Call was deleted!");
            }
            else
            {
                output.WriteLine("Call was not deleted");
            }
            Assert.Null(await cdao.GetById(newCallId));
        }
    }
}