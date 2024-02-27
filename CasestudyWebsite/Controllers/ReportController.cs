using Microsoft.AspNetCore.Mvc;
using CasestudyWebsite.Reports;

namespace ExercisesWebsite.Controllers
{
    public class ReportController : Controller
    {
        private readonly IWebHostEnvironment _env;
        public ReportController(IWebHostEnvironment env)
        {
            _env = env;
        }
        [Route("api/employeereport")]
        [HttpGet]
        public async Task<IActionResult> GetEmployeeReport()
        {
            EmployeeReport report = new();
            await report.GenerateReport(_env.WebRootPath);
            return Ok(new { msg = "Report Generated" });
        }
    }
}