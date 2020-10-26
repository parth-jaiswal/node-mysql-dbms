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
	user: "root",
  password: "",
  database: "hotel"
});

con.connect(function (err) {
	if (err) throw err;
	console.log("Connected!");
});

// CUSTOMER BOOKS RESERVATION
app.get("/", (req,res)=>{
  res.render('index');
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
		roomtype: req.body.roomtype,
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
	//console.log(cust);
	
	//MYSQL QUERY
	//insert into customers
	let insertCustomer = `insert into customer values (10009, '${cust.fname}', "${cust.mname}", "${cust.lname}", '${cust.dob}', '${cust.gender}')`;
	con.query(insertCustomer, (error, result, fields) => {
		if (error) throw error;
		//console.log(result);
		console.log(`${cust.fname} inserted successfully`);
	});

	//insert into customers
	let insertCustDetails = `insert into customer_details values (10009, '${cust.idtype}', "${cust.idno}", "${cust.contact}", '${cust.email}', '${cust.house}', '${cust.city}', '${cust.state}', '${cust.country}')`;
	con.query(insertCustDetails, (error, result, fields) => {
		if (error) throw error;
		console.log(`${cust.fname} details entered`);
  });
	
	//insert into reservation
	var custid;
	let getCustid = `select MAX(cust_id) as custid from customer`;
	con.query(getCustid, (error, result, fields) => {
		if (error) throw error;
		custid = result[0].custid;

		let minRoom = `select min(r.room_no) as rno from reservation r inner join room ro on r.room_no = ro.room_no where ro.room_type = '${cust.roomtype}' and not (r.to_date between '${cust.checkin}' and '${cust.checkout}' or (r.from_date between '${cust.checkin}' and '${cust.checkout}'))`
    con.query(minRoom, (error, result1, fields) => {
			if (error) throw error;
			if(result1[0].rno === null){
				let que = `select min(room_no) as minrno from room where room_type = '${cust.roomtype}'`;
				console.log(que);
				con.query(que, (err, result2, fields)=> {
					if(err) throw err;
					console.log(cust.roomtype);
					console.log(result2[0].minrno);
					let reserve = `insert into reservation values('B${custid}', ${custid}, ${result2[0].minrno}, '${cust.checkin}', '${cust.checkout}')`;
					con.query(reserve, (error, result3, fields) => {
						if (error) throw error;
						console.log(custid, "reserved a room");
					});
				})
			}	else {
				console.log(cust.roomtype);
				console.log(result1[0].rno);
				let reserve = `insert into reservation values('B${custid}', ${custid}, ${result1[0].rno}, '${cust.checkin}', '${cust.checkout}')`;
				con.query(reserve, (error, result, fields) => {
					if (error) throw error;
					console.log(custid, "reserved a room");
				});
			}
		})
	});
	res.redirect("/");
})

//ADMIN PAGE
//DISPLAYS EMPLOYEES DETAILS
app.get('/admin', (req, res)=>{
  let employeeQuery = 'select * from employee e inner join employee_details ed on e.emp_id = ed.emp_id group by e.emp_id';
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
	let insertEmployee = `insert into employee (fname, mname, lname, job_type, gender) values ('${emp.fname}', "${emp.mname}", "${emp.lname}", '${emp.jobtype}', '${emp.gender}')`;
	con.query(insertEmployee, (error, result, fields) => {
		if (error) throw error;
		//console.log(result);
		console.log(`${emp.fname} inserted successfully`);
	});

	//ADD EMPLOYEE DETAILS
	let insertEmpDetails = `insert into employee_details (id_proof, id_no, contact_no, email, house_no, city, state, country) values ('${emp.idtype}', "${emp.idno}", "${emp.contact}", '${emp.email}', '${emp.house}', '${emp.city}', '${emp.state}', '${emp.country}')`;
	con.query(insertEmpDetails, (error, result, fields) => {
		if (error) throw error;
		console.log(`${emp.fname} details entered`);
  });
  
  res.redirect('/admin')
});

//DISPLAYS CUSTOMER DETAILS TO ADMIN
app.get("/customer", (req, res) => {
	let customerQuery =
		"select * from customer c inner join customer_details cd on c.cust_id = cd.cust_id";
	con.query(customerQuery, (error, result, fields) => {
		if (error) throw error;
		res.render("customer", { customers: result });
		//console.log(result);
	});
});

//DISPLAYS INVOICE
app.get("/invoice", (req, res)=>{
	let invoiceQuery = `select * from invoice`
	con.query(invoiceQuery, (error, result, fields)=>{
		if(error) throw error;
		res.render('invoice.ejs', {invoices: result});	
		//console.log(result);
	})
})

//UPDATE INVOICE VALUES
app.post('/invoice', (req, res)=> {
	let custid = req.body.custid;
	let food_charge	 = req.body.food_charge;
	let damage_charge = req.body.damage_charge;
	let booking_no = req.body.booking_no;
	let payment = req.body.payment
	let updateInvoice = `update invoice set food_charge = ${food_charge}, damage_charge = ${damage_charge}, status = '${payment}' where (cust_id = ${custid} and booking_no ='${booking_no}')`;
	con.query(updateInvoice, (err, result, fields) =>{
		if(err) throw err;
		console.log("updated");
	})
	res.redirect('/invoice');								
})

//AVAILABILITY PAGE
app.get('/availability', (req, res)=>{
	res.render("availability", {availability: ""})
});

//CHECK AVAILABILITY PAGE
app.post("/availability", (req, res)=>{
	let from = req.body.from;
	let to = req.body.to;
	let roomtype = req.body.roomtype;
	let availabilityQuery = `select * from reservation r inner join room ro on r.room_no = ro.room_no where ro.room_type = '${roomtype}' and r.to_date between '${from}' and '${to}' or (r.from_date between '${from}' and '${to}')`;
  
	con.query(availabilityQuery, (error, result, fields)=>{
		if(error) throw error;
		console.log(result);
		console.log(typeof(result));
		//console.log();

		if (result.length === 0) {
			res.render("availability", { availability: "Available" });
		} else {
			res.render("availability", { availability: "All Rooms Booked" });
		}
		
	})
	
})

app.listen(3000, ()=>{
  console.log('Server started on port 3000');
});


// let minRoom = `select min(r.room_no)as rno from reservation r inner join room ro on r.room_no = ro.room_no where ro.room_type = 'PREMIUM' and not (r.to_date between '2020-01-01' and '2020-01-03' or (r.from_date between '2020-01-01' and '2020-01-03'))`
//     con.query(minRoom, (error, result1, fields) => {
// 			if (error) throw error;
// 			if(result1[0].rno === null){
// 				con.query(`select min(room_no) as minrno from room where room_type = 'PREMIUM'`, (err, result2, fields)=> {
// 					console.log(result2[0].minrno);
// 				})
// 			} 
// 		}
// 	)	;