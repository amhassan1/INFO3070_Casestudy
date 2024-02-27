$(() => { // main jQuery routine - executes every on page load, $ is short for jquery
    document.addEventListener("change", e => {
        $("#modalstatus").removeClass(); //remove any existing css on div
        if ($("#EmployeeModalForm").valid()) {
            $("#modalstatus").attr("class", "text-white mt-3 mb-2"); //green
            $("#modalstatus").text("Data entered is valid");
            $("#actionbutton").prop("disabled", false); 
        }
        else {
            $("#modalstatus").attr("class", "text-danger mt-3 mb-2"); //red
            $("#modalstatus").text("Fix errors");
            $("#actionbutton").prop("disabled", true);
        }
    });

    const getAll = async (msg) => {
        try {
            $("#employeeList").text("Finding Employee Information...");
            let response = await fetch(`api/employee`);
            if (response.ok) {
                let payload = await response.json(); // this returns a promise, so we await it
                buildEmployeeList(payload);
                msg === "" ? // are we appending to an existing message
                    $("#status").text("Employees Loaded") : $("#status").text(`${msg} - Employees Loaded`);
            } else if (response.status !== 404) { // probably some other client side error
                let problemJson = await response.json();
                errorRtn(problemJson, response.status);
            } else { // else 404 not found
                $("#status").text("no such path on server");
            } // else

            // get department data
            response = await fetch(`api/department`);
            if (response.ok) {
                let divs = await response.json(); // this returns a promise, so we await it
                sessionStorage.setItem("alldepartments", JSON.stringify(divs));
            } else if (response.status !== 404) { // probably some other client side error
                let problemJson = await response.json();
                errorRtn(problemJson, response.status);
            } else { // else 404 not found
                $("#status").text("no such path on server");
            } // else

        } catch (error) {
            $("#status").text(error.message);
        }
    }; // getAll

    const loadDepartmentDDL = (empdiv) => {
        html = '';
        $('#ddlDepartments').empty();
        let alldepartments = JSON.parse(sessionStorage.getItem('alldepartments'));
        alldepartments.forEach((div) => { html += `<option value="${div.id}">${div.name}</option>` });
        $('#ddlDepartments').append(html);
        $('#ddlDepartments').val(empdiv);
    }; // loadDivisionDDL

    $("#EmployeeModalForm").validate({
        rules: {
            TextBoxTitle: { maxlength: 4, required: true, validTitle: true },
            TextBoxFirstname: { maxlength: 25, required: true },
            TextBoxLastname: { maxlength: 25, required: true },
            TextBoxEmail: { maxlength: 40, required: true, email: true },
            TextBoxPhone: { maxlength: 15, required: true }
        },
        errorElement: "div",
        messages: {
            TextBoxTitle: {
                required: "required 1-4 chars.", maxlength: "required 1-4 chars.", validTitle: "Mr. Ms. Mrs. or Dr."
            },
            TextBoxFirstname: {
                required: "required 1-25 chars.", maxlength: "required 1-25 chars."
            },
            TextBoxLastname: {
                required: "required 1-25 chars.", maxlength: "required 1-25 chars."
            },
            TextBoxPhone: {
                required: "required 1-15 chars.", maxlength: "required 1-15 chars."
            },
            TextBoxEmail: {
                required: "required 1-40 chars.", maxlength: "required 1-40 chars.", email: "need valid email format"
            }
        }
    });

    $.validator.addMethod("validTitle", (value) => { //custome rule
        return (value === "Mr." || value === "Ms." || value === "Mrs." || value === "Dr.");
    }, ""); //.validator.addMethod

    $('#deleteprompt').click((e) => {
        $('#deletealert').show();
    });
    $('#deletenobutton').click((e) => {
        $('#deletealert').hide();
    });
    $('#deletebutton').click(() => {
        _delete();
    }); 

    const clearModalFields = () => {
        loadDepartmentDDL(-1);
        $("#TextBoxTitle").val("");
        $("#TextBoxFirstname").val("");
        $("#TextBoxLastname").val("");
        $("#TextBoxPhone").val("");
        $("#TextBoxEmail").val("");
        $("#ImageHolder").html("");
        sessionStorage.removeItem("id");
        sessionStorage.removeItem("departmentId");
        sessionStorage.removeItem("timer");
        sessionStorage.removeItem("picture");
        let validator = $("#EmployeeModalForm").validate();
        validator.resetForm();
    }; // clearModalFields

    const setupForUpdate = (id, data) => {
        $("#actionbutton").val("Update");
        $("#modaltitle").html("<h4>update employee</h4>");
        $('#deletealert').hide();
        $('#deleteprompt').show();
        clearModalFields();
        data.forEach(employee => {
            if (employee.id === parseInt(id)) {
                $("#TextBoxTitle").val(employee.title);
                $("#TextBoxFirstname").val(employee.firstname);
                $("#TextBoxLastname").val(employee.lastname);
                $("#TextBoxPhone").val(employee.phoneno);
                $("#TextBoxEmail").val(employee.email);
                $("#ImageHolder").html(`<img height="120" width="110"
                    src="data:img/png;base64,${employee.staffPicture64}" />`);
                sessionStorage.setItem("id", employee.id);
                sessionStorage.setItem("departmentId", employee.departmentId);
                sessionStorage.setItem("timer", employee.timer);
                sessionStorage.setItem("picture", employee.staffPicture64);
                $("#modalstatus").text("Update data");
                $("#myModal").modal("toggle");
                $("#myModalLabel").text("Update");
                loadDepartmentDDL(employee.departmentId);
            } // if
        }); // data.forEach
    }; // setupForUpdate

    const setupForAdd = () => {
        $("#actionbutton").val("Add");
        $("#modaltitle").html("<h4>add employee</h4>");
        $("#myModal").modal("toggle");
        $("#modalstatus").text("Add new employee");
        $("#myModalLabel").text("Add");
        $('#deletealert').hide();
        $('#deleteprompt').hide();
        clearModalFields();
    }; // setupForAdd


    const update = async () => {
        try {
            // set up a new client side instance of employee
            emp = new Object();
            // pouplate the properties
            emp.title = $("#TextBoxTitle").val();
            emp.firstname = $("#TextBoxFirstname").val();
            emp.lastname = $("#TextBoxLastname").val();
            emp.phoneno = $("#TextBoxPhone").val();
            emp.email = $("#TextBoxEmail").val();
            // we stored these 3 earlier
            emp.id = parseInt(sessionStorage.getItem("id"));
            emp.departmentId = parseInt($("#ddlDepartments").val());
            emp.timer = sessionStorage.getItem("timer");
            sessionStorage.getItem("picture")
                ? emp.staffPicture64 = sessionStorage.getItem("picture")
                : emp.staffPicture64 = null;
            emp.isTech = null;
            // send the updated back to the server asynchronously using PUT
            let response = await fetch("api/employee", {
                method: "PUT",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: JSON.stringify(emp)
            });
            if (response.ok) // or check for response.status
            {
                let data = await response.json();
                getAll(data.msg);
            } else if (response.status !== 404) { // probably some other client side error
                let problemJson = await response.json();
                errorRtn(problemJson, response.status);
            } else { // else 404 not found
                $("#status").text("no such path on server");
            } // else
        } catch (error) {
            $("#status").text(error.message);
        } // try/catch
        $("#myModal").modal("toggle");
    }

    const add = async () => {
        try {
            emp = new Object();
            emp.title = $("#TextBoxTitle").val();
            emp.firstname = $("#TextBoxFirstname").val();
            emp.lastname = $("#TextBoxLastname").val();
            emp.phoneno = $("#TextBoxPhone").val();
            emp.email = $("#TextBoxEmail").val();
            emp.departmentId = parseInt($("#ddlDepartments").val());
            emp.id = -1;
            emp.timer = null;
            emp.picture64 = null;
            emp.isTech = null;
            // send the employee info to the server asynchronously using POST
            let response = await fetch("api/employee", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                },
                body: JSON.stringify(emp)
            });
            if (response.ok) // or check for response.status
            {
                let data = await response.json();
                getAll(data.msg);
            } else if (response.status !== 404) { // probably some other client side error
                let problemJson = await response.json();
                errorRtn(problemJson, response.status);
            } else { // else 404 not found
                $("#status").text("no such path on server");
            } // else
        } catch (error) {
            $("#status").text(error.message);
        } // try/catch
        $("#myModal").modal("toggle");
    }; // add

    const _delete = async () => {
        try {
            let response = await fetch(`api/employee/${sessionStorage.getItem('id')}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            });
            if (response.ok) // or check for response.status
            {
                let data = await response.json();
                getAll(data.msg);
            } else {
                $('#status').text(`Status - ${response.status}, Problem on delete server side, see server console`);
            } // else
            $('#myModal').modal('toggle');
        } catch (error) {
            $('#status').text(error.message);
        }
    }; // delete

    $("#actionbutton").click(async (e) => { // update button click event handler
        $("#actionbutton").val() === "Update" ? update() : add();
    }); // update button click

    $("#employeeList").click((e) => {
        if (!e) e = window.event;
        let id = e.target.parentNode.id;
        if (id === "employeeList" || id === "") {
            id = e.target.id;
        } // clicked on row somewhere else
        if (id !== "status" && id !== "heading") {
            let data = JSON.parse(sessionStorage.getItem("allemployees"));
            id === "0" ? setupForAdd() : setupForUpdate(id, data);
        } else {
            return false; // ignore if they clicked on heading or status
        }
    }); // employeeList Click


    $("#srch").keyup(() => {
        let alldata = JSON.parse(sessionStorage.getItem("allemployees"));
        let filtereddata = alldata.filter((emp) => emp.lastname.match(new RegExp($("#srch").val(), 'i')));
        buildEmployeeList(filtereddata, false);
    }); // srch keyup

    const buildEmployeeList = (data, usealldata = true) => {
        $("#employeeList").empty();
        div = $(`<div class="list-group-item row d-flex" id="status">Employee Info</div>
                 <div class= "list-group-item row d-flex text-center" id="heading">
                 <div class="col-2 h4">Title</div>
                 <div class="col-5 h4">First</div>
                 <div class="col-5 h4">Last</div>
                 </div>`);

        div.appendTo($("#employeeList"));
        usealldata ? sessionStorage.setItem("allemployees", JSON.stringify(data)) : null;
        btn = $(`<button class="list-group-item row d-flex" id="0">Click to add employee</button>`);
        btn.appendTo("#employeeList");
        data.forEach(emp => {
            btn = $(`<button class="list-group-item row d-flex" id="${emp.id}">`);
            btn.html(`<div class="col-2" id="employeetitle${emp.id}">${emp.title}</div>
                      <div class="col-5" id="employeefname${emp.id}">${emp.firstname}</div>
                      <div class="col-5" id="employeelastnam${emp.id}">${emp.lastname}</div>`
            );
            btn.appendTo($("#employeeList"));
        }); // forEach
    }; // buildEmployeeList

    $("input:file").change(() => {
        const reader = new FileReader();
        const file = $("#uploader")[0].files[0];
        file ? reader.readAsBinaryString(file) : null;
        reader.onload = (readerEvt) => {
            // get binary data then convert to encoded string
            const binaryString = reader.result;
            const encodedString = btoa(binaryString);
            sessionStorage.setItem('picture', encodedString);
        };
    });

    //Report
    $("#pdfbutton").click(async (e) => {
        try {
            $("#reportstatuslbl").text("generating report on server - please wait...");
            let response = await fetch(`api/employeereport`);
            if (!response.ok) // check for response.status
                throw new Error(`Status - ${response.status}, Text - ${response.statusText}`);
            let data = await response.json(); // this returns a promise, so we await it
            data.msg === "Report Generated"
                ? ( window.open("/pdfs/Employeelist.pdf"), $("#reportstatuslbl").text(data.msg) )
                : $("#reportstatuslbl").text("problem generating report");
        } catch (error) {
            $("#lblstatus").text(error.message);
        } // try/catch
    });

    getAll(""); // first grab the data from the server


}); // jQuery ready method



// server was reached but server had a problem with the call
const errorRtn = (problemJson, status) => {
    if (status > 499) {
        $("#status").text("Problem server side, see debug console");
    } else {
        let keys = Object.keys(problemJson.errors)
        problem = {
            status: status,
            statusText: problemJson.errors[keys[0]][0], // first error
        };
        $("#status").text("Problem client side, see browser console");
        console.log(problem);
    } // else
}
