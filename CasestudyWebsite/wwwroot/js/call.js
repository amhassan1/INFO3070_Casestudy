$(() => {
    document.addEventListener("keyup", e => {
        $("#modalstatus").removeClass(); //remove any existing css on div
        if ($("#CallModalForm").valid()) {
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
            $("#callList").text("Finding Call Information...");
            let response = await fetch(`api/call`);
            if (response.ok) {
                let payload = await response.json(); // this returns a promise, so we await it
                buildCallList(payload);
                msg === "" ? // are we appending to an existing message
                    $("#status").text("Calls Loaded") : $("#status").text(`${msg} - Calls Loaded`);
            } else if (response.status !== 404) { // probably some other client side error
                let problemJson = await response.json();
                errorRtn(problemJson, response.status);
            } else { // else 404 not found
                $("#status").text("no such path on server");
            } // else

            response = await fetch(`api/employee`);
            if (response.ok) {
                let emps = await response.json(); // this returns a promise, so we await it
                sessionStorage.setItem("allemployees", JSON.stringify(emps));
            } else if (response.status !== 404) { // probably some other client side error
                let problemJson = await response.json();
                errorRtn(problemJson, response.status);
            } else { // else 404 not found
                $("#status").text("no such path on server");
            }

            response = await fetch(`api/problem`);
            if (response.ok) {
                let problems = await response.json(); // this returns a promise, so we await it
                sessionStorage.setItem("allproblems", JSON.stringify(problems));
            } else if (response.status !== 404) { // probably some other client side error
                let problemJson = await response.json();
                errorRtn(problemJson, response.status);
            } else { // else 404 not found
                $("#status").text("no such path on server");
            }
        } catch (error) {
            $("#status").text(error.message);
        }
    };

    //Employee dropdown menu
    const loadEmployeeDDL = (empdiv) => {
        html = '';
        $('#ddlEmployees').empty();
        let allemployees = JSON.parse(sessionStorage.getItem('allemployees'));
        allemployees.forEach((emp) => { html += `<option value="${emp.id}">${emp.lastname}</option>` });
        $('#ddlEmployees').append(html);
        $('#ddlEmployees').val(empdiv);
    };

    //Problem dropdown menu
    const loadProblemDDL = (empdiv) => {
        html = '';
        $('#ddlProblems').empty();
        let allproblems = JSON.parse(sessionStorage.getItem('allproblems'));
        allproblems.forEach((problem) => { html += `<option value="${problem.id}">${problem.description}</option>` });
        $('#ddlProblems').append(html);
        $('#ddlProblems').val(empdiv);
    };

    //Tech dropdown menu
    const loadTechDDL = (empdiv) => {
        html = '';
        $('#ddlTechnicians').empty();
        let allemployees = JSON.parse(sessionStorage.getItem('allemployees'));
        allemployees.filter((emp) => emp.isTech).forEach((tech) => { html += `<option value="${tech.id}">${tech.lastname}</option>` });
        $('#ddlTechnicians').append(html);
        $('#ddlTechnicians').val(empdiv);
    };

    //validation
    $("#CallModalForm").validate({
        rules: {
            ddlProblems: {  required: true },
            ddlEmployees: { required: true },
            ddlTechnicians: { required: true },
            notes: { maxlength: 250, required: true }
        },
        errorElement: "div",
        messages: {
            ddlProblems: {
                required: "Select Problem"
            },
            ddlEmployees: {
                required: "Select Employee"
            },
            ddlTechnicians: {
                required: "Select Tech"
            },
            notes: {
                required: "required 1-250 chars.", maxlength: "required 1-250 chars."
            }
        }
    });

    const buildCallList = (data, usealldata = true) => {
        $("#callList").empty();
        div = $(`<div class="list-group-item row d-flex" id="status">Call Info</div>
                 <div class= "list-group-item row d-flex text-center" id="heading">
                 <div class="col-4 h4">Date</div>
                 <div class="col-4 h4">For</div>
                 <div class="col-4 h4">Problem</div>
                 </div>`);

        div.appendTo($("#callList"));
        usealldata ? sessionStorage.setItem("allcalls", JSON.stringify(data)) : null;
        btn = $(`<button class="list-group-item row d-flex" id="0">Click to add call</button>`);
        btn.appendTo("#callList");
        data.forEach(call => {
            btn = $(`<button class="list-group-item row d-flex" id="${call.id}">`);
            btn.html(`<div class="col-4" id="calldate${call.id}">${formatDate(call.dateOpened).replace("T", " ")}</div>
                      <div class="col-4" id="callfor${call.id}">${call.employeeName}</div>
                      <div class="col-4" id="callproblem${call.id}">${call.problemDescription}</div>`
            );
            btn.appendTo($("#callList"));
        });
    };

    const clearModalFields = () => {
        loadEmployeeDDL(-1);
        loadProblemDDL(-1);
        loadTechDDL(-1);
        //$("#DateOpenedText").text("");
        $("#DateClosedText").text("");
        $("#checkBoxClose").prop('checked', false);
        $("#notes").val("");
        sessionStorage.removeItem("id");
        sessionStorage.removeItem("timer");
        sessionStorage.removeItem("employeeId");
        sessionStorage.removeItem("problemId");
        sessionStorage.removeItem("techId");
        let validator = $("#CallModalForm").validate();
        validator.resetForm();
    };

    const setupForUpdate = (id, data) => {
        $("#actionbutton").val("Update");
        $("#modaltitle").html("<h4>update call</h4>");
        $("#dateClosedRow").show();
        $("#closeCallRow").show();
        $('#deletealert').hide();
        $('#deleteprompt').show();
        clearModalFields();
        data.forEach(call => {
            if (call.id === parseInt(id)) {
                $("#ddlEmployees").attr('disabled', false);
                $("#ddlTechnicians").attr('disabled', false);
                $("#ddlProblems").attr('disabled', false);
                $("#notes").attr('readonly', false);
                $("#checkBoxClose").attr('disabled', false);

                $("#DateOpenedText").text(formatDate(call.dateOpened).replace("T", " "));
                $("#DateClosedText").text(call.dateClosed ? formatDate(call.dateClosed).replace("T", " ") : "");
                $("#notes").val(call.notes);
                sessionStorage.setItem("dateOpened", call.dateOpened);
                sessionStorage.setItem("dateClosed", call.dateClosed ? call.dateClosed : "");
                sessionStorage.setItem("id", call.id);
                sessionStorage.setItem("employeeId", call.employeeId);
                sessionStorage.setItem("problemId", call.problemId);
                sessionStorage.setItem("techId", call.techId);
                sessionStorage.setItem("timer", call.timer);
                $("#modalstatus").text("Update/Delete data");
                $("#myModal").modal("toggle");
                $("#myModalLabel").text("View");
                $("#actionbutton").show()
                loadEmployeeDDL(call.employeeId);
                loadProblemDDL(call.problemId);
                loadTechDDL(call.techId);
                if (!call.openStatus) {
                    $("#myModalLabel").text("View");
                    $("#modalstatus").text("Delete data");

                    $("#ddlEmployees").attr('disabled', true);
                    $("#ddlTechnicians").attr('disabled', true);
                    $("#ddlProblems").attr('disabled', true);
                    $("#notes").attr('readonly', true);
                    $("#actionbutton").hide();
                    $("#checkBoxClose").prop('checked', true);
                    $("#checkBoxClose").attr('disabled', true);
                }
            } // if
        }); // data.forEach
    };

    const setupForAdd = () => {
        $("#ddlEmployees").attr('disabled', false);
        $("#ddlTechnicians").attr('disabled', false);
        $("#ddlProblems").attr('disabled', false);
        $("#notes").attr('readonly', false);
        $("#DateClosedText").text('');

        $("#actionbutton").show();

        $("#DateOpenedText").text(formatDate().replace("T", " "));
        sessionStorage.setItem("dateOpened", formatDate());

        $("#actionbutton").val("Add");
        $("#modaltitle").html("<h4>add call</h4>");
        $("#myModal").modal("toggle");
        $("#modalstatus").text("Add new call");
        $("#myModalLabel").text("Add");

        $("#dateClosedRow").hide();
        $("#closeCallRow").hide();

        $('#deletealert').hide();
        $('#deleteprompt').hide();
        clearModalFields();
    };

    const update = async () => {
        try {
            call = new Object();
            
            call.employeeId = parseInt($("#ddlEmployees").val());
            call.problemId = parseInt($("#ddlProblems").val());
            call.techId = parseInt($("#ddlTechnicians").val());
            call.dateOpened = sessionStorage.getItem("dateOpened");
            call.notes = $("#notes").val();
            call.dateClosed = sessionStorage.getItem("dateClosed") === "" ? null : sessionStorage.getItem("dateClosed");
            call.openStatus = !($("#checkBoxClose").is(":checked"));
            call.id = sessionStorage.getItem("id");
            call.timer = sessionStorage.getItem("timer");

            let response = await fetch("api/call", {
                method: "PUT",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: JSON.stringify(call)
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
            call = new Object();
            call.employeeId = parseInt($("#ddlEmployees").val());
            call.problemId = parseInt($("#ddlProblems").val());
            call.techId = parseInt($("#ddlTechnicians").val());
            call.dateOpened = sessionStorage.getItem("dateOpened");
            call.notes = $("#notes").val();
            call.dateClosed = null;
            call.openStatus = true;
            call.id = -1;
            call.timer = null;
            
            let response = await fetch("api/call", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                },
                body: JSON.stringify(call)
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
    };

    const _delete = async () => {
        try {
            let response = await fetch(`api/call/${sessionStorage.getItem('id')}`, {
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

    $("#callList").click((e) => {
        if (!e) e = window.event;
        let id = e.target.parentNode.id;
        if (id === "callList" || id === "") {
            id = e.target.id;
        } // clicked on row somewhere else
        if (id !== "status" && id !== "heading") {
            let data = JSON.parse(sessionStorage.getItem("allcalls"));
            id === "0" ? setupForAdd() : setupForUpdate(id, data);
        } else {
            return false; // ignore if they clicked on heading or status
        }
    });

    $("#srch").keyup(() => {
        let alldata = JSON.parse(sessionStorage.getItem("allcalls"));
        let filtereddata = alldata.filter((call) => call.employeeName.match(new RegExp($("#srch").val(), 'i')));
        buildCallList(filtereddata, false);
    });

    $('#deleteprompt').click((e) => {
        $('#deletealert').show();
    });
    $('#deletenobutton').click((e) => {
        $('#deletealert').hide();
    });
    $('#deletebutton').click(() => {
        _delete();
    }); 

    $("#actionbutton").click((e) => {
        $("#actionbutton").val() === "Update" ? update() : add();
    });

    $("#checkBoxClose").click(() => {
        if ($("#checkBoxClose").is(":checked")) {
            $("#DateClosedText").text(formatDate().replace("T", " "));
            sessionStorage.setItem("dateClosed", formatDate());
        } else {
            $("#DateClosedText").text("");
            sessionStorage.setItem("dateClosed", "");
        }
    }); // checkBoxClose

    const formatDate = (date) => {
        let d;
        (date === undefined) ? d = new Date() : d = new Date(Date.parse(date));
        let _day = d.getDate();
        if (_day < 10) { _day = "0" + _day; }
        let _month = d.getMonth() + 1;
        if (_month < 10) { _month = "0" + _month; }
        let _year = d.getFullYear();
        let _hour = d.getHours();
        if (_hour < 10) { _hour = "0" + _hour; }
        let _min = d.getMinutes();
        if (_min < 10) { _min = "0" + _min; }
        return _year + "-" + _month + "-" + _day + "T" + _hour + ":" + _min;
    } // formatDate

    getAll("");
});

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