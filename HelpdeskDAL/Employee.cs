﻿using System;
using System.Collections.Generic;

namespace HelpdeskDAL
{
    public partial class Employee : HelpdeskEntity
    {
        public Employee()
        {
            CallEmployees = new HashSet<Call>();
            CallTeches = new HashSet<Call>();
        }

        
        public string? Title { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNo { get; set; }
        public string? Email { get; set; }
        public int DepartmentId { get; set; }
        public bool? IsTech { get; set; }
        public byte[]? StaffPicture { get; set; }
        

        public virtual Department Department { get; set; } = null!;
        public virtual ICollection<Call> CallEmployees { get; set; }
        public virtual ICollection<Call> CallTeches { get; set; }
    }
}
