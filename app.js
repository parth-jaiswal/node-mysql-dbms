const mysql = require('mysql');
const express  = require ('express');
const bodyParser  = require ('body-parser');
const ejs  = require ('ejs');
const { constant } = require('async');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");


//create connection
var con = mysql.createConnection({
	host: "localhost",
	user: "parthdb",
  password: "",
  database: "hotel"
});

con.connect(function (err) {
	if (err) throw err;
	console.log("Connected!");
});

// CUSTOMER BOOKS RESERVATION
app.get("/", (req,res)=>{
  var sql = "select * from employee_details where emp_id=10001";
	con.query(sql, (error, result, fields) => {
		if (error) throw error;
    //console.log(result);
    res.render('index', {list: JSON.stringify(result)});
	});
})

//BOOKING FORM
app.post("/", (req, res) => {
	let cust = {
		fname: req.body.fname,
		mname: req.body.mname,
		lname: req.body.lname,
		idtype: req.body.idtype,
		idno: req.body.idno,
		checkin: req.body.checkin,
		checkout: req.body.checkout,
		roomType: req.body.roomType,
		dob: req.body.dob,
		gender: req.body.gender,
		contact: req.body.contact,
		email: req.body.email,
		house: req.body.house,
		city: req.body.city,
		state: req.body.state,
		country: req.body.country,
	};
	for (i in cust) {
		if (cust[i] == "") {
			cust[i] = null;
		}
	}
	console.log(cust);
	//MYSQL QUERY
	//insert into customers
	let insertCustomer = `insert into customer values (10006, '${cust.fname}', "${cust.mname}", "${cust.lname}", '${cust.dob}', '${cust.gender}')`;
	con.query(insertCustomer, (error, result, fields) => {
		if (error) throw error;
		//console.log(result);
		console.log(`${cust.fname} inserted successfully`);
	});

	//insert into customers
	let insertCustDetails = `insert into customer_details values (10006, '${cust.idtype}', "${cust.idno}", "${cust.contact}", '${cust.email}', '${cust.house}', '${cust.city}', '${cust.state}', '${cust.country}')`;
	con.query(insertCustDetails, (error, result, fields) => {
		if (error) throw error;
		console.log(`${cust.fname} details entered`);
  });
  
    res.redirect("/");

})

//ADMIN PAGE
//DISPLAYS EMPLOYEES DETAILS
app.get('/admin', (req, res)=>{
  let employeeQuery = 'select * from employee e inner join employee_details ed on e.emp_id = ed.emp_id';
  con.query(employeeQuery, (error, result, fields) => {
    if (error) throw error;
    res.render('admin', {employees: result} );
    //console.log(result);
  })
})
//ADD NEW EMPLOYEE FORM
app.post("/admin", (req, res) => {
	let emp = {
		fname: req.body.fname,
		mname: req.body.mname,
		lname: req.body.lname,
		idtype: req.body.idtype,
		idno: req.body.idno,
    gender: req.body.gender,
    jobtype: req.body.jobtype,
		contact: req.body.contact,
		email: req.body.email,
		house: req.body.house,
		city: req.body.city,
		state: req.body.state,
		country: req.body.country,
	};
	for (i in emp) {
		if (emp[i] == undefined) {
			emp[i] = "";
		}
	}
	console.log(emp);
  //MYSQL QUERY ADD EMPLOYEE
	let insertEmployee = `insert into employee values (10008, '${emp.fname}', "${emp.mname}", "${emp.lname}", '${emp.jobtype}', '${emp.gender}')`;
	con.query(insertEmployee, (error, result, fields) => {
		if (error) throw error;
		//console.log(result);
		console.log(`${emp.fname} inserted successfully`);
	});

	let insertEmpDetails = `insert into employee_details values (10008, '${emp.idtype}', "${emp.idno}", "${emp.contact}", '${emp.email}', '${emp.house}', '${emp.city}', '${emp.state}', '${emp.country}')`;
	con.query(insertEmpDetails, (error, result, fields) => {
		if (error) throw error;
		console.log(`${emp.fname} details entered`);
  });
  
  res.redirect('/admin')
});


app.get("/customer", (req, res) => {
	let customerQuery =
		"select * from customer c inner join customer_details cd on c.cust_id = cd.cust_id";
	con.query(customerQuery, (error, result, fields) => {
		if (error) throw error;
		res.render("customer", { customers: result });
		console.log(result);
	});
});


app.listen(3000, ()=>{
  console.log('Server started on port 3000');
});