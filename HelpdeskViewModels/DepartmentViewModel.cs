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
    public class DepartmentViewModel
    {
        readonly private DepartmentDAO _dao;
        public int? Id { get; set; }
        public string? Name { get; set; }
        public string? Timer { get; set; }

        public DepartmentViewModel()
        {
            _dao = new DepartmentDAO();
        }

        public async Task<List<DepartmentViewModel>> GetAll()
        {
            List<DepartmentViewModel> allVms = new();
            try
            {
                List<Department> allDepartments = await _dao.GetAll();
                // we need to convert Student instance to StudentViewModel because
                // the Web Layer isn't aware of the Domain class Student
                foreach (Department div in allDepartments)
                {
                    DepartmentViewModel divVm = new()
                    {
                        Id = div.Id,
                        Name = div.DepartmentName,
                        // binary value needs to be stored on client as base64
                        Timer = Convert.ToBase64String(div.Timer!)
                    };
                    allVms.Add(divVm);
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
