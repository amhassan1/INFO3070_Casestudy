using System.Threading.Tasks;
using Xunit;
using HelpdeskViewModels;
using Xunit.Abstractions;

namespace CassestudyTests
{
    public class ViewModelTests
    {
        private readonly ITestOutputHelper output;
        public ViewModelTests(ITestOutputHelper output)
        {
            this.output = output;
        }

        [Fact]
        public async Task Employee_GetByEmailTest()
        {
            EmployeeViewModel vm = new() { Email = "bs@abc.com" };
            await vm.GetByEmail();
            Assert.NotNull(vm.Firstname);
        }
        [Fact]
        public async Task Employee_GetByIdTest()
        {
            EmployeeViewModel vm = new() { Id = 1 };
            await vm.GetById();
            Assert.NotNull(vm.Firstname);
        }
        [Fact]
        public async Task Employee_GetAllTest()
        {
            List<EmployeeViewModel> allEmployees;
            EmployeeViewModel vm = new();
            allEmployees =  await vm.GetAll();
            Assert.True(allEmployees.Count > 0);
        }
        [Fact]
        public async Task Employee_AddTest()
        {
            EmployeeViewModel vm;
            vm = new()
            {
                Title = "Mr",
                Firstname = "Abdulaziz",
                Lastname = "Hassan",
                Phoneno = "(555) 555-5555",
                Email = "a_hassan159323@fanshaweonline.ca",
                DepartmentId = 500,
            };
            await vm.Add();
            Assert.True(vm.Id > 0);
        }
        [Fact]
        public async Task Employee_UpdateTest()
        {
            EmployeeViewModel vm = new() { Email = "ah@abc.com"};
            await vm.GetByEmail();
            vm.Phoneno = vm.Phoneno == "(555)555-5551" ? "(555)555-5552" : "(555)555-5551";
            Assert.True(await vm.Update() == 1);
        }
        [Fact]
        public async Task Employee_DeleteTest()
        {
            EmployeeViewModel vm = new() { Email = "js@abc.com" };
            await vm.GetByEmail();
            Assert.True(await vm.Delete() == 1);
        }
        [Fact]
        public async Task Employee_ConcurrencyTest()
        {
            EmployeeViewModel vm1 = new() { Email = "js@abc.com" };
            EmployeeViewModel vm2 = new() { Email = "js@abc.com" };
            await vm1.GetByEmail(); // Fetch same student to simulate 2 users
            if (vm1.Lastname != "Not Found") // make sure we found a student
            {
                await vm2.GetByEmail(); // fetch same data
                vm1.Phoneno = vm1.Phoneno == "(555)555-5551" ? "(555)555-5552" : "(555)555-5551";
                if (await vm1.Update() == 1)
                {
                    vm2.Phoneno = "(666)666-6666"; // just need any value
                    Assert.True(await vm2.Update() == -2);
                }
            }
            else
            {
                Assert.True(false); // student not found
            }
        }
        [Fact]
        public async Task Call_ComprehensiveVMTest()
        {
            CallViewModel cvm = new();
            EmployeeViewModel evm = new();
            ProblemViewModel pvm = new();
            cvm.DateOpened = DateTime.Now;
            cvm.DateClosed = null;
            cvm.OpenStatus = true;
            evm.Email = "ah@abc.com";
            await evm.GetByEmail();
            cvm.EmployeeId = Convert.ToInt16(evm.Id);
            evm.Email = "bb@abc.com";
            await evm.GetByEmail();
            cvm.TechId = Convert.ToInt16(evm.Id);
            pvm.Description = "Memory Upgrade";
            await pvm.GetByDescription();
            cvm.ProblemId = pvm.Id;
            cvm.Notes = "Hassan has bad RAM, Burner to fix it";
            await cvm.Add();
            output.WriteLine("New Call Generated - Id = " + cvm.Id);
            int id = cvm.Id; // need id for delete later
            await cvm.GetById();
            cvm.Notes += "\n Ordered new RAM!";
            if (await cvm.Update() == 1)
            {
                output.WriteLine("Call was updated " + cvm.Notes);
            }
            else
            {
                output.WriteLine("Call was not updated!");
            }
            cvm.Notes = "Another change to comments that should not work";
            if (await cvm.Update() == -2)
            {
                output.WriteLine("Call was not updated data was stale");
            }
            cvm = new CallViewModel
            {
                Id = id
            };
            // need to reset because of concurrency error
            await cvm.GetById();
            if (await cvm.Delete() == 1)
            {
                output.WriteLine("Call was deleted!");
            }
            else
            {
                output.WriteLine("Call was not deleted");
            }
            // should throw expected exception
            Task<NullReferenceException> ex = Assert.ThrowsAsync<NullReferenceException>(async ()
           => await cvm.GetById());
        }


    }
}
