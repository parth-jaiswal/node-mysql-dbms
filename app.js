const mysql = require('mysql');
const express  = require ('express');
const bodyParser  = require ('body-parser');
const ejs  = require ('ejs');
const { constant } = require('async');
const { response } = require('express');

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
		if (cust[i] == "" ) {
			cust[i] = "\'\'";
		}
	}
	//console.log(cust);
	
	//MYSQL QUERY
	//insert into customers
	let insertCustomer = `insert into customer (fname, mname, lname, DOB, gender) values ('${cust.fname}', "${cust.mname}", "${cust.lname}", '${cust.dob}', '${cust.gender}')`;
	con.query(insertCustomer, (error, result, fields) => {
		if (error) throw error;
		//console.log(result);
		console.log(`${cust.fname} inserted successfully`);
	});

	//insert into customers
	let insertCustDetails = `insert into customer_details (id_proof, id_no, contact_no, email, house_no, city, state, country) values ('${cust.idtype}', "${cust.idno}", "${cust.contact}", '${cust.email}', '${cust.house}', '${cust.city}', '${cust.state}', '${cust.country}')`;
	con.query(insertCustDetails, (error, result, fields) => {
		if (error) throw error;
		console.log(`${cust.fname} details entered`);
  });
	
	
	var custid;
	let getCustid = `select MAX(cust_id) as custid from customer`;
	con.query(getCustid, (error, result, fields) => {
		if (error) throw error;
		custid = result[0].custid;

		//INSERT INTO RESERVATION
		let minRoom = `select min(r.room_no) as rno from reservation r inner join room ro on r.room_no = ro.room_no where ro.room_type = '${cust.roomtype}' and not (r.to_date between '${cust.checkin}' and '${cust.checkout}' or (r.from_date between '${cust.checkin}' and '${cust.checkout}'))`;
		con.query(minRoom, (error, result1, fields) => {
			if (error) throw error;
			if (result1[0].rno === null) {
				let que = `select min(room_no) as minrno from room where room_type = '${cust.roomtype}'`;
				console.log(que);
				con.query(que, (err, result2, fields) => {
					if (err) throw err;
					console.log(cust.roomtype);
					console.log(result2[0].minrno);
					let reserve = `insert into reservation values('B${custid}', ${custid}, ${result2[0].minrno}, '${cust.checkin}', '${cust.checkout}')`;
					con.query(reserve, (error, result3, fields) => {
						if (error) throw error;
						console.log(custid, "reserved a room");
					});
				});
			} else {
				// console.log(cust.roomtype);
				// console.log(result1[0].rno);
				let reserve = `insert into reservation values('B${custid}', ${custid}, ${result1[0].rno}, '${cust.checkin}', '${cust.checkout}')`;
				con.query(reserve, (error, result, fields) => {
					if (error) throw error;
					console.log(custid, "reserved a room");
				});
			}

			//INSERT INTO INVOICE
			let roomPrice = `select r.booking_no, (datediff(r.to_date, r.from_date) * x.price) as cost 
											 	from reservation r inner join (select ro.room_no, price 
												from room ro inner join pricing p on ro.room_type = p.room_type) x 
												on x.room_no = r.room_no
												order by r.booking_no desc limit 1`;
      con.query(roomPrice, (err, result4, fields) => {
				if(err) throw err;
				let cost = result4[0].cost;
				let insertInvoice = `insert into invoice (invoice_no, booking_no, cust_id, room_charge, status) values ('I${custid}', 'B${custid}', ${custid}, ${cost}, 'UNPAID')`;
				con.query(insertInvoice, (err, result5, fields)=>{
					if (err) throw err;
					console.log(custid, "Invoice Created");
				})
			})
			
		});
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
	let availabilityQuery = `select * from reservation r inner join room ro on r.room_no = ro.room_no where ro.room_type = '${roomtype}' and not (r.to_date between '${from}' and '${to}' or (r.from_date between '${from}' and '${to}'))`;
  
	con.query(availabilityQuery, (error, result, fields)=>{
		if(error) throw error;
		// console.log(result);
		// console.log(typeof(result));

		if (result.length === 0) {
			res.render("availability", { availability: "All Rooms Booked" });
		} else {
			res.render("availability", { availability: "Available" });
		}
		
	})
	
})


app.get('/feedback', (req, res)=>{
	let feedback = `select c.fname, f.rating, f.comments from feedback f inner join customer c on f.cust_id = c.cust_id	`;
	con.query(feedback, (error, result, fields)=> {
		if(error) throw error;
		console.log(result);
		res.render('feedback', {feedback: result});
	}) 
})

app.post('/feedback', (req, res)=>{
	let cust_id = req.body.cust_id;
	let rating = req.body.rating;
	let comments = req.body.comments;
	let insertFeedback = `insert into feedback values (${cust_id}, ${rating}, "${comments}")`;
	con.query(insertFeedback, (error, result, fields) => {
		if(error) throw error;
		console.log('Feedback Inserted');
	})
	res.redirect('/feedback')
})

app.listen(3000, ()=>{
	console.log('Server started on port 3000');
});

