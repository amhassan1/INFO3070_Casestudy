using HelpdeskDAL;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace HelpdeskViewModels
{
    public class ProblemViewModel
    {
        readonly private ProblemDAO _dao;
        public int Id { get; set; }
        public string? Description { get; set; }
        public string? Timer { get; set; }

        public ProblemViewModel()
        {
            _dao = new ProblemDAO();
        }

        public async Task GetByDescription()
        {
            try
            {
                Problem problem = await _dao.GetByDescription(Description!);
                Id = problem.Id;
                Description = problem.Description;
                Timer = Convert.ToBase64String(problem.Timer!);
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
        }

        public async Task<List<ProblemViewModel>> GetAll()
        {
            List<ProblemViewModel> allVms = new();
            try
            {
                List<Problem> allProblems = await _dao.GetAll();
                foreach (Problem problem in allProblems)
                {
                    ProblemViewModel problemVm = new()
                    {
                        Id = problem.Id,
                        Description = problem.Description,
                        Timer = Convert.ToBase64String(problem.Timer!)
                    };
                    allVms.Add(problemVm);
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return allVms;
        }
    }
}
